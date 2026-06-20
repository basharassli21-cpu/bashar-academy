import { requireAuth } from '../../../lib/auth'
import { hashPassword } from '../../../lib/db'
import {
  getAllEmployeesWithStats, createEmployee, getEmployeeByUsername,
  updateEmployee, deleteEmployee, employeeAvatar,
} from '../../../lib/sales-db'

async function handler(req, res) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحيات غير كافية' })

  if (req.method === 'GET') {
    const employees = await getAllEmployeesWithStats()
    return res.status(200).json({
      employees: employees.map(e => ({
        id: e.id, username: e.username, name: e.name, avatar: employeeAvatar(e.name),
        monthlyTarget: e.monthly_target, createdAt: e.created_at, stats: e.stats,
      })),
    })
  }

  if (req.method === 'POST') {
    const { username, password, name, monthlyTarget } = req.body || {}
    if (!username || !password || !name) return res.status(400).json({ error: 'يرجى ملء جميع الحقول' })
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return res.status(400).json({ error: 'اسم المستخدم: أحرف إنجليزية وأرقام فقط، 3-20 حرف' })
    }
    if (password.length < 6) return res.status(400).json({ error: 'كلمة المرور: 6 أحرف على الأقل' })

    const usernameNorm = username.toLowerCase().trim()
    const existing = await getEmployeeByUsername(usernameNorm)
    if (existing) return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' })

    const passwordHash = await hashPassword(password)
    const employee = await createEmployee({
      username: usernameNorm, passwordHash, name: name.trim(),
      monthlyTarget: Number(monthlyTarget) || 0,
    })
    return res.status(201).json({ success: true, employee: { ...employee, avatar: employeeAvatar(employee.name) } })
  }

  if (req.method === 'PATCH') {
    const { id, name, monthlyTarget, newPassword } = req.body || {}
    if (!id) return res.status(400).json({ error: 'missing id' })
    const updates = {}
    if (name && name.trim()) updates.name = name.trim()
    if (monthlyTarget !== undefined) updates.monthlyTarget = Number(monthlyTarget) || 0
    if (newPassword && newPassword.length >= 6) updates.passwordHash = await hashPassword(newPassword)
    const updated = await updateEmployee(id, updates)
    if (!updated) return res.status(404).json({ error: 'الموظف غير موجود' })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'missing id' })
    await deleteEmployee(id)
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAuth(handler)

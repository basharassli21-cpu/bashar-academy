import { useState, useRef, useCallback } from 'react'
import { IMPORT_FIELDS, detectColumnMapping, normalizeStatusValue } from '../lib/import-mapping'

const FIELD_LABELS = {
  name:            { ar: 'الاسم',              en: 'Name' },
  phone:           { ar: 'رقم الهاتف',          en: 'Phone Number' },
  status:          { ar: 'الحالة',              en: 'Status' },
  note:            { ar: 'ملاحظات',             en: 'Note' },
  lastContactDate: { ar: 'تاريخ آخر تواصل',     en: 'Last Call Date' },
  nextFollowupDate:{ ar: 'تاريخ المتابعة القادمة', en: 'Next Follow-up Date' },
}
const STATUS_LABELS = {
  new: { ar: 'جديد', en: 'New' }, contacted: { ar: 'تم التواصل', en: 'Contacted' },
  interested: { ar: 'مهتم', en: 'Interested' }, not_interested: { ar: 'غير مهتم', en: 'Not Interested' },
  closed_sale: { ar: 'تم البيع', en: 'Closed Sale' }, cancelled: { ar: 'ألغى الفكرة', en: 'Cancelled' },
}

function cellToDateString(value) {
  if (!value) return null
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null
    const y = value.getFullYear(), m = String(value.getMonth() + 1).padStart(2, '0'), d = String(value.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const str = String(value).trim()
  if (!str) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const parsed = new Date(str)
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear(), m = String(parsed.getMonth() + 1).padStart(2, '0'), d = String(parsed.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return null
}

// dataRowsText comes from a raw:false parse (every cell as displayed text —
// critical for phone numbers, since raw:true infers a leading-zero phone
// like "0791234567" as the number 791234567, silently losing the zero).
// dataRowsTyped comes from a raw:true + cellDates:true parse, used only for
// date columns so genuine Excel date cells arrive as real Date objects
// instead of ambiguous locale-formatted text.
function buildRows(headers, dataRowsText, dataRowsTyped, mapping) {
  const colIndex = {}
  for (const field of IMPORT_FIELDS) colIndex[field] = mapping[field] ? headers.indexOf(mapping[field]) : -1

  const valid = []
  const skipped = []
  dataRowsText.forEach((rowArr, i) => {
    const rowNum = i + 2
    const isBlank = rowArr.every(cell => cell === '' || cell == null)
    if (isBlank) { skipped.push({ rowNum, reason: 'blank' }); return }
    const get = (field) => (colIndex[field] >= 0 ? rowArr[colIndex[field]] : '')
    const getDateValue = (field) => {
      const idx = colIndex[field]
      if (idx < 0) return ''
      const typedVal = dataRowsTyped[i]?.[idx]
      return typedVal instanceof Date ? typedVal : rowArr[idx]
    }
    const phone = String(get('phone') || '').trim()
    if (!phone) { skipped.push({ rowNum, reason: 'no_phone' }); return }
    valid.push({
      _rowNum: rowNum,
      name: String(get('name') || '').trim(),
      phone,
      status: String(get('status') || '').trim(),
      note: String(get('note') || '').trim(),
      lastContactDate: cellToDateString(getDateValue('lastContactDate')),
      nextFollowupDate: cellToDateString(getDateValue('nextFollowupDate')),
    })
  })

  const byPhone = new Map()
  for (const row of valid) {
    if (byPhone.has(row.phone)) skipped.push({ rowNum: byPhone.get(row.phone)._rowNum, reason: 'duplicate_in_file' })
    byPhone.set(row.phone, row)
  }
  return { rows: [...byPhone.values()], skipped }
}

const SKIP_REASON_LABEL = {
  blank: { ar: 'صف فارغ', en: 'Blank row' },
  no_phone: { ar: 'رقم هاتف مفقود', en: 'Missing phone' },
  duplicate_in_file: { ar: 'مكرر داخل الملف', en: 'Duplicate within file' },
}

export default function ImportLeadsPanel({ C, lang, employees }) {
  const [subView, setSubView] = useState('upload')
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')
  const [headers, setHeaders] = useState([])
  const [mapping, setMapping] = useState({})
  const [rows, setRows] = useState([])
  const [skipped, setSkipped] = useState([])
  const [showSkipped, setShowSkipped] = useState(false)
  const [existingPhones, setExistingPhones] = useState(new Set())
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [duplicateStrategy, setDuplicateStrategy] = useState('update')
  const [assignmentMode, setAssignmentMode] = useState('round_robin')
  const [employeeId, setEmployeeId] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importResult, setImportResult] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [history, setHistory] = useState([])
  const fileInputRef = useRef(null)

  const t = (obj) => (lang === 'ar' ? obj.ar : obj.en)
  const dataRowsTextRef = useRef([])
  const dataRowsTypedRef = useRef([])

  async function checkDuplicates(phones) {
    setCheckingDuplicates(true)
    const res = await fetch('/api/admin/leads-import/check-phones', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phones }),
    })
    const dup = await res.json()
    setExistingPhones(new Set(dup.existing || []))
    setCheckingDuplicates(false)
  }

  async function handleFile(file) {
    if (!file) return
    setParsing(true)
    setParseError('')
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const dataText = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
      const dataTyped = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true })
      if (dataText.length < 2) throw new Error(lang === 'ar' ? 'الملف لا يحتوي على بيانات' : 'File has no data rows')

      const fileHeaders = dataText[0].map(h => String(h).trim())
      const dataRowsText = dataText.slice(1)
      const dataRowsTyped = dataTyped.slice(1)
      dataRowsTextRef.current = dataRowsText
      dataRowsTypedRef.current = dataRowsTyped
      const detected = detectColumnMapping(fileHeaders)
      const { rows: builtRows, skipped: builtSkipped } = buildRows(fileHeaders, dataRowsText, dataRowsTyped, detected)

      setHeaders(fileHeaders)
      setMapping(detected)
      setRows(builtRows)
      setSkipped(builtSkipped)
      setFileName(file.name)
      setImportResult(null)

      await checkDuplicates(builtRows.map(r => r.phone))
    } catch (err) {
      setParseError(err.message || (lang === 'ar' ? 'تعذرت قراءة الملف' : 'Could not read the file'))
    } finally {
      setParsing(false)
    }
  }

  function remapColumn(field, header) {
    const newMapping = { ...mapping, [field]: header || null }
    setMapping(newMapping)
    const { rows: builtRows, skipped: builtSkipped } = buildRows(headers, dataRowsTextRef.current, dataRowsTypedRef.current, newMapping)
    setRows(builtRows)
    setSkipped(builtSkipped)
    checkDuplicates(builtRows.map(r => r.phone))
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [])

  const duplicateCount = rows.filter(r => existingPhones.has(r.phone)).length
  const newCount = rows.length - duplicateCount

  function resetAll() {
    setFileName(null); setHeaders([]); setMapping({}); setRows([]); setSkipped([])
    setExistingPhones(new Set()); setImportResult(null); setImportError('')
  }

  async function handleImport() {
    setImporting(true)
    setImportError('')
    try {
      const res = await fetch('/api/admin/leads-import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileName,
          rows: rows.map(({ _rowNum, ...r }) => r),
          duplicateStrategy,
          assignmentMode,
          employeeId: assignmentMode === 'employee' ? employeeId : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setImportError(data.error || (lang === 'ar' ? 'حدث خطأ' : 'Something went wrong')); return }
      setImportResult(data)
    } finally {
      setImporting(false)
    }
  }

  async function loadHistory() {
    setHistoryLoading(true)
    const res = await fetch('/api/admin/leads-import/history')
    const data = await res.json()
    setHistory(data.history || [])
    setHistoryLoading(false)
  }

  function switchSubView(view) {
    setSubView(view)
    if (view === 'history') loadHistory()
  }

  const selectStyle = { background: C.navy, border: `1px solid ${C.g20}`, borderRadius: '8px', padding: '7px 10px', color: C.white, fontSize: '12.5px', outline: 'none' }
  const radioLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.white, cursor: 'pointer', padding: '8px 12px', borderRadius: '10px', border: `1px solid ${C.g20}`, background: C.navy }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {['upload', 'history'].map(v => (
          <button key={v} onClick={() => switchSubView(v)} style={{
            padding: '8px 18px', borderRadius: '10px', border: `1px solid ${subView === v ? C.gold : C.g20}`,
            background: subView === v ? C.g15 : 'transparent', color: subView === v ? C.gold : C.silver,
            fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
          }}>{v === 'upload' ? (lang === 'ar' ? 'رفع ملف' : 'Upload') : (lang === 'ar' ? 'سجل الاستيراد' : 'History')}</button>
        ))}
      </div>

      {subView === 'history' ? (
        historyLoading ? (
          <p style={{ color: C.silver, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        ) : history.length === 0 ? (
          <p style={{ color: C.silver, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>{lang === 'ar' ? 'لا يوجد عمليات استيراد سابقة' : 'No imports yet'}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map(h => (
              <div key={h.id} style={{ background: C.surface, border: `1px solid ${C.g20}`, borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <p style={{ color: C.white, fontSize: '13px', fontWeight: '700' }}>{h.filename}</p>
                  <p style={{ color: C.silver, fontSize: '11px' }}>{new Date(h.created_at).toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US')} · {h.uploaded_by}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: C.silver, flexWrap: 'wrap' }}>
                  <span>{lang === 'ar' ? 'مستورد' : 'Imported'}: <b style={{ color: C.emerald }}>{h.imported_count}</b></span>
                  <span>{lang === 'ar' ? 'محدث' : 'Updated'}: <b style={{ color: C.gold }}>{h.updated_count}</b></span>
                  <span>{lang === 'ar' ? 'متجاهل' : 'Skipped'}: <b style={{ color: C.silver }}>{h.skipped_count}</b></span>
                  <span>{lang === 'ar' ? 'غير صالح' : 'Invalid'}: <b style={{ color: C.red }}>{h.invalid_count}</b></span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : !fileName ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? C.gold : C.g20}`, borderRadius: '16px', padding: '48px 24px',
            textAlign: 'center', cursor: 'pointer', background: dragActive ? C.g10 : C.surface, transition: 'all 0.15s',
          }}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files?.[0])} />
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>📥</div>
          <p style={{ color: C.white, fontSize: '14px', fontWeight: '700', marginBottom: '6px' }}>
            {lang === 'ar' ? 'اسحب وأفلت الملف هنا أو اضغط للاختيار' : 'Drag & drop a file here, or click to choose'}
          </p>
          <p style={{ color: C.silver, fontSize: '12px' }}>Excel (.xlsx) · CSV (.csv)</p>
          {parsing && <p style={{ color: C.gold, fontSize: '12.5px', marginTop: '14px' }}>{lang === 'ar' ? 'جاري القراءة...' : 'Reading file...'}</p>}
          {parseError && <p style={{ color: C.red, fontSize: '12.5px', marginTop: '14px' }}>{parseError}</p>}
        </div>
      ) : importResult ? (
        <div style={{ background: C.surface, border: `1px solid ${C.g20}`, borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>✅</div>
          <p style={{ color: C.white, fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>{lang === 'ar' ? 'تم الاستيراد بنجاح' : 'Import complete'}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span style={{ color: C.emerald, fontSize: '13px' }}>{lang === 'ar' ? 'مستورد' : 'Imported'}: <b>{importResult.imported}</b></span>
            <span style={{ color: C.gold, fontSize: '13px' }}>{lang === 'ar' ? 'محدث' : 'Updated'}: <b>{importResult.updated}</b></span>
            <span style={{ color: C.silver, fontSize: '13px' }}>{lang === 'ar' ? 'متجاهل' : 'Skipped'}: <b>{importResult.skipped}</b></span>
            <span style={{ color: C.red, fontSize: '13px' }}>{lang === 'ar' ? 'غير صالح' : 'Invalid'}: <b>{importResult.invalid}</b></span>
          </div>
          <button onClick={resetAll} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: C.gold, color: C.navy, fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>
            {lang === 'ar' ? 'استيراد ملف آخر' : 'Import another file'}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ color: C.white, fontSize: '13.5px', fontWeight: '700' }}>📄 {fileName}</p>
            <button onClick={resetAll} style={{ background: 'none', border: 'none', color: C.red, fontSize: '12px', cursor: 'pointer' }}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.g20}`, borderRadius: '14px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ color: C.silver, fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>{lang === 'ar' ? 'مطابقة الأعمدة' : 'Column mapping'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              {IMPORT_FIELDS.map(field => (
                <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: C.silver, fontWeight: '600' }}>{t(FIELD_LABELS[field])}</span>
                  <select value={mapping[field] || ''} onChange={(e) => remapColumn(field, e.target.value)} style={selectStyle}>
                    <option value="">{lang === 'ar' ? '— لا يوجد —' : '— none —'}</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ color: C.silver, fontSize: '12.5px' }}>{lang === 'ar' ? 'إجمالي الصفوف' : 'Total rows'}: <b style={{ color: C.white }}>{rows.length + skipped.length}</b></span>
            <span style={{ color: C.emerald, fontSize: '12.5px' }}>{lang === 'ar' ? 'صالح' : 'Valid'}: <b>{rows.length}</b></span>
            <span style={{ color: C.gold, fontSize: '12.5px' }}>{checkingDuplicates ? '...' : (lang === 'ar' ? 'مكرر' : 'Duplicates')}: <b>{checkingDuplicates ? '' : duplicateCount}</b></span>
            <span style={{ color: C.red, fontSize: '12.5px' }}>{lang === 'ar' ? 'غير صالح' : 'Invalid'}: <b>{skipped.length}</b></span>
          </div>

          {skipped.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <button onClick={() => setShowSkipped(s => !s)} style={{ background: 'none', border: 'none', color: C.silver, fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline' }}>
                {showSkipped ? (lang === 'ar' ? 'إخفاء الصفوف المتجاهلة' : 'Hide skipped rows') : (lang === 'ar' ? `عرض الصفوف المتجاهلة (${skipped.length})` : `View skipped rows (${skipped.length})`)}
              </button>
              {showSkipped && (
                <div style={{ marginTop: '8px', maxHeight: '160px', overflowY: 'auto', background: C.navy, borderRadius: '10px', padding: '10px 14px' }}>
                  {skipped.map((s, i) => (
                    <p key={i} style={{ color: C.silver, fontSize: '11.5px', marginBottom: '3px' }}>
                      {lang === 'ar' ? 'صف' : 'Row'} {s.rowNum}: {t(SKIP_REASON_LABEL[s.reason])}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ overflowX: 'auto', marginBottom: '20px', border: `1px solid ${C.g20}`, borderRadius: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: C.surface }}>
                  {IMPORT_FIELDS.map(f => <th key={f} style={{ padding: '9px 12px', textAlign: lang === 'ar' ? 'right' : 'left', color: C.silver, fontWeight: '700', whiteSpace: 'nowrap' }}>{t(FIELD_LABELS[f])}</th>)}
                  <th style={{ padding: '9px 12px', color: C.silver, fontWeight: '700' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, i) => {
                  const isDup = existingPhones.has(row.phone)
                  const normalizedStatus = normalizeStatusValue(row.status)
                  return (
                    <tr key={i} style={{ borderTop: `1px solid ${C.g20}` }}>
                      <td style={{ padding: '8px 12px', color: C.white }}>{row.name || '—'}</td>
                      <td style={{ padding: '8px 12px', color: C.white }}>{row.phone}</td>
                      <td style={{ padding: '8px 12px', color: C.silver }}>{t(STATUS_LABELS[normalizedStatus])}</td>
                      <td style={{ padding: '8px 12px', color: C.silver, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.note || '—'}</td>
                      <td style={{ padding: '8px 12px', color: C.silver, whiteSpace: 'nowrap' }}>{row.lastContactDate || '—'}</td>
                      <td style={{ padding: '8px 12px', color: C.silver, whiteSpace: 'nowrap' }}>{row.nextFollowupDate}</td>
                      <td style={{ padding: '8px 12px' }}>
                        {isDup && <span style={{ fontSize: '10px', background: C.g10, color: C.gold, padding: '2px 7px', borderRadius: '5px', fontWeight: '700' }}>{lang === 'ar' ? 'مكرر' : 'duplicate'}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {rows.length > 20 && (
              <p style={{ color: C.silver, fontSize: '11px', padding: '8px 12px' }}>{lang === 'ar' ? `+ ${rows.length - 20} صف آخر` : `+ ${rows.length - 20} more rows`}</p>
            )}
          </div>

          {duplicateCount > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <p style={{ color: C.silver, fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
                {lang === 'ar' ? `تم العثور على ${duplicateCount} رقم مكرر في النظام — ماذا تريد أن تفعل؟` : `${duplicateCount} phone numbers already exist — what should happen to them?`}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <label style={radioLabelStyle}>
                  <input type="radio" checked={duplicateStrategy === 'update'} onChange={() => setDuplicateStrategy('update')} />
                  {lang === 'ar' ? 'تحديث البيانات الموجودة' : 'Update existing records'}
                </label>
                <label style={radioLabelStyle}>
                  <input type="radio" checked={duplicateStrategy === 'ignore'} onChange={() => setDuplicateStrategy('ignore')} />
                  {lang === 'ar' ? 'تجاهل السجل' : 'Ignore (skip)'}
                </label>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: C.silver, fontSize: '12px', fontWeight: '700', marginBottom: '8px' }}>
              {lang === 'ar' ? `توزيع العملاء الجدد (${newCount})` : `Assign new leads (${newCount})`}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
              <label style={radioLabelStyle}>
                <input type="radio" checked={assignmentMode === 'round_robin'} onChange={() => setAssignmentMode('round_robin')} />
                {lang === 'ar' ? `توزيع بالتساوي على الموظفين (${employees.length})` : `Round robin across employees (${employees.length})`}
              </label>
              <label style={radioLabelStyle}>
                <input type="radio" checked={assignmentMode === 'employee'} onChange={() => setAssignmentMode('employee')} />
                {lang === 'ar' ? 'تعيين لموظف محدد' : 'Assign to a specific employee'}
              </label>
              <label style={radioLabelStyle}>
                <input type="radio" checked={assignmentMode === 'openc'} onChange={() => setAssignmentMode('openc')} />
                {lang === 'ar' ? 'إرسال إلى OpenC' : 'Send to OpenC'}
              </label>
            </div>
            {assignmentMode === 'employee' && (
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={selectStyle}>
                <option value="">{lang === 'ar' ? 'اختر موظفاً' : 'Select employee'}</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            )}
          </div>

          {importError && <p style={{ color: C.red, fontSize: '12.5px', marginBottom: '12px' }}>{importError}</p>}

          <button
            onClick={handleImport}
            disabled={importing || rows.length === 0 || (assignmentMode === 'employee' && !employeeId) || (assignmentMode === 'round_robin' && employees.length === 0)}
            style={{
              padding: '11px 28px', borderRadius: '10px', border: 'none', background: C.gold, color: C.navy,
              fontSize: '13.5px', fontWeight: '800', cursor: 'pointer', opacity: importing ? 0.6 : 1,
            }}
          >
            {importing ? (lang === 'ar' ? 'جارٍ الاستيراد...' : 'Importing...') : (lang === 'ar' ? `استيراد (${rows.length})` : `Import (${rows.length})`)}
          </button>
        </div>
      )}
    </div>
  )
}

// lib/sale-finance.js — carries an approved CRM sale record into the finance module.
// Imports carry their .js extension so scripts/ can load this file with plain Node too.

import { createSale } from './finance-db.js'
import { resolveSaleAmounts, toDateOnlyString } from './sales-db.js'

const PAYMENT_METHOD = { bank_transfer: 'bank', cash: 'cash', cliq: 'bank', other: 'manual' }
const PACKAGE_NAME = {
  elite: 'Elite — الباقة الكاملة',
  professional: 'Professional — الباقة المتوسطة',
  starter: 'Starter — باقة التنفيذ',
}

// Creates the finance sale (invoice, journal entry, commission) for a row of
// sale_records. A sale counts as fully paid when it is marked paid or its
// deposit already covers the amount; a smaller deposit makes it a partial payment.
export async function recordSaleInFinance(sale, actorUsername) {
  const amounts = resolveSaleAmounts({ amountPaid: sale.amount_paid, deposit: sale.deposit })
  const total = amounts.amountPaid || 0
  const deposit = amounts.deposit || 0
  const paymentStatus = sale.sale_status === 'cancelled' ? 'cancelled'
    : sale.sale_status === 'paid' || deposit >= total ? 'paid'
    : deposit > 0 ? 'partial' : 'pending'

  return await createSale({
    customerName:  sale.student_name.trim(),
    customerPhone: sale.student_phone_normalized,
    employeeId:    sale.employee_id,
    productType:   'course',
    productName:   PACKAGE_NAME[sale.package_name] || sale.package_name,
    total,
    amountPaid:    deposit || undefined,
    paymentMethod: PAYMENT_METHOD[sale.payment_method] || 'bank',
    paymentStatus,
    currency:      'JOD',
    source:        'crm',
    notes:         sale.notes || null,
    saleDate:      toDateOnlyString(sale.sale_date) || new Date().toISOString().split('T')[0],
  }, actorUsername)
}

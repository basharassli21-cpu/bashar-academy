import 'dotenv/config'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)

async function migrate() {
  console.log('🏦 Running Finance System migration...')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_accounts (
      id            SERIAL PRIMARY KEY,
      code          VARCHAR(20)  UNIQUE NOT NULL,
      name          VARCHAR(200) NOT NULL,
      name_ar       VARCHAR(200),
      type          VARCHAR(50)  NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')),
      category      VARCHAR(100),
      parent_id     INTEGER REFERENCES fin_accounts(id),
      balance       NUMERIC(15,2) DEFAULT 0,
      currency      VARCHAR(3)   DEFAULT 'USD',
      description   TEXT,
      is_active     BOOLEAN DEFAULT TRUE,
      is_deleted    BOOLEAN DEFAULT FALSE,
      created_at    TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ fin_accounts')

  await sql`CREATE SEQUENCE IF NOT EXISTS fin_invoice_seq    START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS fin_expense_seq    START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS fin_payment_seq    START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS fin_withdrawal_seq START 1`
  await sql`CREATE SEQUENCE IF NOT EXISTS fin_journal_seq    START 1`
  console.log('✓ sequences')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_journal_entries (
      id           SERIAL PRIMARY KEY,
      entry_number VARCHAR(50)  UNIQUE NOT NULL,
      entry_date   DATE         NOT NULL DEFAULT CURRENT_DATE,
      description  TEXT,
      reference    VARCHAR(200),
      source_type  VARCHAR(50),
      source_id    INTEGER,
      created_by   VARCHAR(100),
      is_posted    BOOLEAN DEFAULT TRUE,
      is_deleted   BOOLEAN DEFAULT FALSE,
      created_at   TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS fin_journal_lines (
      id          SERIAL PRIMARY KEY,
      entry_id    INTEGER REFERENCES fin_journal_entries(id) ON DELETE CASCADE,
      account_id  INTEGER REFERENCES fin_accounts(id),
      debit       NUMERIC(15,2) DEFAULT 0,
      credit      NUMERIC(15,2) DEFAULT 0,
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ journal tables')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_sales (
      id               SERIAL PRIMARY KEY,
      invoice_number   VARCHAR(50)  UNIQUE NOT NULL,
      customer_name    VARCHAR(200),
      customer_email   VARCHAR(200),
      customer_phone   VARCHAR(50),
      customer_country VARCHAR(100),
      employee_id      INTEGER REFERENCES employees(id),
      lead_id          INTEGER REFERENCES leads(id),
      product_type     VARCHAR(50)  DEFAULT 'other',
      product_name     VARCHAR(200),
      course_id        VARCHAR(100),
      consultation_id  INTEGER,
      subtotal         NUMERIC(15,2) NOT NULL DEFAULT 0,
      discount_amount  NUMERIC(15,2) DEFAULT 0,
      discount_pct     NUMERIC(5,2)  DEFAULT 0,
      coupon_code      VARCHAR(100),
      tax_rate         NUMERIC(5,2)  DEFAULT 0,
      tax_amount       NUMERIC(15,2) DEFAULT 0,
      total            NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency         VARCHAR(3)   DEFAULT 'USD',
      payment_method   VARCHAR(50)  DEFAULT 'manual',
      payment_status   VARCHAR(50)  DEFAULT 'pending',
      refund_status    VARCHAR(50)  DEFAULT 'none',
      refund_amount    NUMERIC(15,2) DEFAULT 0,
      refund_reason    TEXT,
      refunded_at      TIMESTAMPTZ,
      source           VARCHAR(100),
      notes            TEXT,
      journal_entry_id INTEGER REFERENCES fin_journal_entries(id),
      is_deleted       BOOLEAN DEFAULT FALSE,
      deleted_at       TIMESTAMPTZ,
      sale_date        DATE        NOT NULL DEFAULT CURRENT_DATE,
      created_at       TIMESTAMPTZ DEFAULT now(),
      updated_at       TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ fin_sales')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_expenses (
      id               SERIAL PRIMARY KEY,
      expense_number   VARCHAR(50)  UNIQUE NOT NULL,
      category         VARCHAR(100) NOT NULL,
      sub_category     VARCHAR(100),
      vendor           VARCHAR(200),
      description      TEXT,
      amount           NUMERIC(15,2) NOT NULL DEFAULT 0,
      currency         VARCHAR(3)   DEFAULT 'USD',
      tax_amount       NUMERIC(15,2) DEFAULT 0,
      total_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
      employee_id      INTEGER REFERENCES employees(id),
      payment_method   VARCHAR(50),
      payment_status   VARCHAR(50)  DEFAULT 'paid',
      receipt_url      TEXT,
      invoice_url      TEXT,
      approval_status  VARCHAR(50)  DEFAULT 'approved',
      approved_by      VARCHAR(100),
      approval_notes   TEXT,
      approved_at      TIMESTAMPTZ,
      is_recurring     BOOLEAN DEFAULT FALSE,
      recurrence_pattern VARCHAR(50),
      recurrence_end_date DATE,
      expense_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
      notes            TEXT,
      journal_entry_id INTEGER REFERENCES fin_journal_entries(id),
      is_deleted       BOOLEAN DEFAULT FALSE,
      deleted_at       TIMESTAMPTZ,
      created_at       TIMESTAMPTZ DEFAULT now(),
      updated_at       TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ fin_expenses')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_payments (
      id             SERIAL PRIMARY KEY,
      payment_number VARCHAR(50)  UNIQUE NOT NULL,
      payment_type   VARCHAR(50)  NOT NULL DEFAULT 'incoming',
      amount         NUMERIC(15,2) NOT NULL,
      currency       VARCHAR(3)   DEFAULT 'USD',
      method         VARCHAR(50)  NOT NULL DEFAULT 'manual',
      status         VARCHAR(50)  DEFAULT 'completed',
      reference      VARCHAR(200),
      sale_id        INTEGER REFERENCES fin_sales(id),
      expense_id     INTEGER REFERENCES fin_expenses(id),
      withdrawal_id  INTEGER,
      description    TEXT,
      payment_date   DATE DEFAULT CURRENT_DATE,
      metadata       JSONB DEFAULT '{}',
      is_deleted     BOOLEAN DEFAULT FALSE,
      created_at     TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ fin_payments')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_withdrawals (
      id                SERIAL PRIMARY KEY,
      withdrawal_number VARCHAR(50)  UNIQUE NOT NULL,
      employee_id       INTEGER REFERENCES employees(id) NOT NULL,
      amount            NUMERIC(15,2) NOT NULL,
      currency          VARCHAR(3)   DEFAULT 'USD',
      reason            TEXT,
      status            VARCHAR(50)  DEFAULT 'requested',
      approved_by       VARCHAR(100),
      approval_notes    TEXT,
      approved_at       TIMESTAMPTZ,
      rejected_at       TIMESTAMPTZ,
      payment_date      DATE,
      payment_method    VARCHAR(50),
      reference_number  VARCHAR(200),
      is_deleted        BOOLEAN DEFAULT FALSE,
      requested_at      TIMESTAMPTZ DEFAULT now(),
      updated_at        TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ fin_withdrawals')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_commission_rules (
      id                     SERIAL PRIMARY KEY,
      employee_id            INTEGER REFERENCES employees(id),
      applies_to             VARCHAR(50) DEFAULT 'all',
      rule_type              VARCHAR(50) NOT NULL DEFAULT 'percentage',
      rate                   NUMERIC(8,4) DEFAULT 0,
      fixed_amount           NUMERIC(15,2) DEFAULT 0,
      tier_config            JSONB DEFAULT '[]',
      monthly_bonus_threshold NUMERIC(15,2),
      monthly_bonus_amount   NUMERIC(15,2),
      is_active              BOOLEAN DEFAULT TRUE,
      effective_from         DATE DEFAULT CURRENT_DATE,
      effective_until        DATE,
      notes                  TEXT,
      created_at             TIMESTAMPTZ DEFAULT now()
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS fin_commissions (
      id                 SERIAL PRIMARY KEY,
      employee_id        INTEGER REFERENCES employees(id) NOT NULL,
      sale_id            INTEGER REFERENCES fin_sales(id),
      period_year        INTEGER NOT NULL,
      period_month       INTEGER NOT NULL,
      commission_type    VARCHAR(50) DEFAULT 'sale',
      gross_sale_amount  NUMERIC(15,2) DEFAULT 0,
      rate               NUMERIC(8,4)  DEFAULT 0,
      commission_amount  NUMERIC(15,2) NOT NULL DEFAULT 0,
      adjustment_amount  NUMERIC(15,2) DEFAULT 0,
      adjustment_reason  TEXT,
      final_amount       NUMERIC(15,2) NOT NULL DEFAULT 0,
      status             VARCHAR(50) DEFAULT 'pending',
      paid_at            TIMESTAMPTZ,
      payment_reference  VARCHAR(200),
      notes              TEXT,
      is_deleted         BOOLEAN DEFAULT FALSE,
      created_at         TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ commission tables')

  await sql`
    CREATE TABLE IF NOT EXISTS fin_audit_log (
      id            SERIAL PRIMARY KEY,
      actor_username VARCHAR(100),
      actor_role     VARCHAR(50),
      action         VARCHAR(100) NOT NULL,
      entity_type    VARCHAR(50),
      entity_id      INTEGER,
      before_state   JSONB,
      after_state    JSONB,
      ip_address     VARCHAR(50),
      created_at     TIMESTAMPTZ DEFAULT now()
    )
  `
  console.log('✓ fin_audit_log')

  // Performance indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_sales_date     ON fin_sales(sale_date)         WHERE NOT is_deleted`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_sales_emp      ON fin_sales(employee_id)       WHERE NOT is_deleted`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_sales_status   ON fin_sales(payment_status)    WHERE NOT is_deleted`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_sales_type     ON fin_sales(product_type)      WHERE NOT is_deleted`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_exp_date       ON fin_expenses(expense_date)   WHERE NOT is_deleted`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_exp_cat        ON fin_expenses(category)       WHERE NOT is_deleted`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_comm_period    ON fin_commissions(period_year, period_month, employee_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_payments_sale  ON fin_payments(sale_id)        WHERE NOT is_deleted`
  await sql`CREATE INDEX IF NOT EXISTS idx_fin_audit_created  ON fin_audit_log(created_at DESC)`
  console.log('✓ indexes')

  await seedChartOfAccounts()
  console.log('✅ Finance migration complete!')
}

async function seedChartOfAccounts() {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM fin_accounts`
  if (count > 0) { console.log('  (accounts already seeded)'); return }

  const accounts = [
    { code: '1000', name: 'Cash on Hand',           name_ar: 'النقد في الصندوق',         type: 'asset',     category: 'Current Assets' },
    { code: '1010', name: 'Bank Account',            name_ar: 'الحساب البنكي',             type: 'asset',     category: 'Current Assets' },
    { code: '1020', name: 'Stripe Balance',          name_ar: 'رصيد سترايب',               type: 'asset',     category: 'Current Assets' },
    { code: '1030', name: 'PayPal Balance',          name_ar: 'رصيد باي بال',              type: 'asset',     category: 'Current Assets' },
    { code: '1040', name: 'Crypto Wallet',           name_ar: 'محفظة العملات الرقمية',    type: 'asset',     category: 'Current Assets' },
    { code: '1100', name: 'Accounts Receivable',     name_ar: 'الذمم المدينة',             type: 'asset',     category: 'Current Assets' },
    { code: '2000', name: 'Accounts Payable',        name_ar: 'الذمم الدائنة',             type: 'liability', category: 'Current Liabilities' },
    { code: '2010', name: 'Withdrawals Payable',     name_ar: 'سحوبات الموظفين المستحقة', type: 'liability', category: 'Current Liabilities' },
    { code: '2020', name: 'Commissions Payable',     name_ar: 'العمولات المستحقة',         type: 'liability', category: 'Current Liabilities' },
    { code: '2030', name: 'Tax Payable',             name_ar: 'الضرائب المستحقة',          type: 'liability', category: 'Current Liabilities' },
    { code: '3000', name: 'Owner Equity',            name_ar: 'حقوق الملكية',              type: 'equity',    category: 'Equity' },
    { code: '3010', name: 'Retained Earnings',       name_ar: 'الأرباح المحتجزة',          type: 'equity',    category: 'Equity' },
    { code: '4000', name: 'Course Sales Revenue',    name_ar: 'إيرادات بيع الدورات',       type: 'revenue',   category: 'Operating Revenue' },
    { code: '4010', name: 'Consultation Revenue',    name_ar: 'إيرادات الاستشارات',        type: 'revenue',   category: 'Operating Revenue' },
    { code: '4020', name: 'Other Revenue',           name_ar: 'إيرادات أخرى',              type: 'revenue',   category: 'Other Revenue' },
    { code: '5000', name: 'Marketing & Ads',         name_ar: 'التسويق والإعلان',           type: 'expense',   category: 'Marketing' },
    { code: '5010', name: 'Hosting & Infrastructure',name_ar: 'الاستضافة والبنية التحتية', type: 'expense',   category: 'Technology' },
    { code: '5020', name: 'Software & Subscriptions',name_ar: 'البرامج والاشتراكات',       type: 'expense',   category: 'Technology' },
    { code: '5030', name: 'Employee Salaries',       name_ar: 'رواتب الموظفين',            type: 'expense',   category: 'Personnel' },
    { code: '5040', name: 'Employee Commissions',    name_ar: 'عمولات الموظفين',           type: 'expense',   category: 'Personnel' },
    { code: '5050', name: 'Freelancers',             name_ar: 'المستقلون',                 type: 'expense',   category: 'Personnel' },
    { code: '5060', name: 'Office Expenses',         name_ar: 'مصاريف المكتب',             type: 'expense',   category: 'Operations' },
    { code: '5070', name: 'Travel & Transport',      name_ar: 'السفر والتنقل',             type: 'expense',   category: 'Operations' },
    { code: '5080', name: 'Education & Training',    name_ar: 'التعليم والتدريب',           type: 'expense',   category: 'Operations' },
    { code: '5090', name: 'Equipment',               name_ar: 'المعدات والأجهزة',          type: 'expense',   category: 'Capital' },
    { code: '5100', name: 'Taxes',                   name_ar: 'الضرائب',                   type: 'expense',   category: 'Tax' },
    { code: '5110', name: 'Utilities',               name_ar: 'المرافق والخدمات',          type: 'expense',   category: 'Operations' },
    { code: '5120', name: 'Other Expenses',          name_ar: 'مصاريف أخرى',              type: 'expense',   category: 'Other' },
  ]

  for (const a of accounts) {
    await sql`
      INSERT INTO fin_accounts (code, name, name_ar, type, category)
      VALUES (${a.code}, ${a.name}, ${a.name_ar}, ${a.type}, ${a.category})
      ON CONFLICT (code) DO NOTHING
    `
  }
  console.log(`  seeded ${accounts.length} accounts`)
}

migrate().catch(e => { console.error(e); process.exit(1) })

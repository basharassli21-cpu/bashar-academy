export interface Dictionary {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    filter: string;
    actions: string;
    status: string;
    name: string;
    phone: string;
    note: string;
    notes: string;
    date: string;
    loading: string;
    noResults: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    page: string;
    of: string;
    yes: string;
    no: string;
    all: string;
    error: string;
    success: string;
    required: string;
    optional: string;
    close: string;
    submit: string;
    download: string;
    upload: string;
    call: string;
    whatsapp: string;
    overdue: string;
    dueToday: string;
  };
  auth: {
    login: string;
    logout: string;
    username: string;
    password: string;
    loginTitle: string;
    loginSubtitle: string;
    invalidCredentials: string;
    accountDeactivated: string;
    tooManyAttempts: string;
    twoFactorTitle: string;
    twoFactorSubtitle: string;
    twoFactorCodeLabel: string;
    twoFactorCodePlaceholder: string;
    verifyCode: string;
    invalidTwoFactorCode: string;
    backToLogin: string;
  };
  roles: {
    ADMIN: string;
    TEAM_LEADER: string;
    SALES_EMPLOYEE: string;
  };
  status: {
    NEW: string;
    CONTACTED: string;
    INTERESTED: string;
    NOT_INTERESTED: string;
    CLOSED_SALE: string;
    CANCELLED: string;
  };
  nav: {
    dashboard: string;
    employees: string;
    teamLeaders: string;
    leads: string;
    importLeads: string;
    distribute: string;
    openc: string;
    auditLog: string;
    myLeads: string;
    settings: string;
    webhooks: string;
    security: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
  };
  locale: {
    ar: string;
    en: string;
  };
  employees: {
    title: string;
    create: string;
    createTitle: string;
    editTitle: string;
    username: string;
    fullName: string;
    monthlyTarget: string;
    teamLeader: string;
    noTeamLeader: string;
    activeStatus: string;
    active: string;
    inactive: string;
    deactivate: string;
    reactivate: string;
    deactivateConfirmTitle: string;
    deactivateConfirmDesc: string;
    reactivateConfirmTitle: string;
    reactivateConfirmDesc: string;
    newPasswordOptional: string;
    searchPlaceholder: string;
    usernameTaken: string;
    createdSuccess: string;
    updatedSuccess: string;
  };
  teamLeaders: {
    title: string;
    create: string;
    createTitle: string;
    roster: string;
    noEmployees: string;
    assignEmployee: string;
    selectEmployee: string;
    unassign: string;
    unassignConfirmTitle: string;
    unassignConfirmDesc: string;
    assignedSuccess: string;
  };
  leads: {
    title: string;
    create: string;
    createTitle: string;
    customerName: string;
    owner: string;
    unowned: string;
    noOwnerOption: string;
    searchPlaceholder: string;
    statusFilterAll: string;
    lastContact: string;
    nextFollowup: string;
    phoneTaken: string;
    createdSuccess: string;
    updateTitle: string;
    logCallNote: string;
    notePlaceholder: string;
    saveUpdate: string;
    updateSuccess: string;
    callHistory: string;
    noNotesYet: string;
    transfer: string;
    transferTitle: string;
    transferSuccess: string;
    deleteConfirmTitle: string;
    deleteConfirmDesc: string;
    deleteSuccess: string;
    backToList: string;
    pullToOpenC: string;
    pullToOpenCConfirmTitle: string;
    pullToOpenCConfirmDesc: string;
    pullToOpenCSuccess: string;
    selectedCount: string;
    clearSelection: string;
    bulkTransfer: string;
    bulkTransferTitle: string;
    bulkTransferSuccess: string;
    bulkDelete: string;
    bulkDeleteConfirmTitle: string;
    bulkDeleteConfirmDesc: string;
    bulkDeleteSuccess: string;
    exportCsv: string;
    tableView: string;
    kanbanView: string;
    moreInStatus: string;
    tags: string;
    addTagPlaceholder: string;
    savePreset: string;
    presetNameLabel: string;
    presetNamePlaceholder: string;
    noPresets: string;
  };
  openc: {
    title: string;
    searchPlaceholder: string;
    pulledAt: string;
    empty: string;
    claim: string;
    claimSuccess: string;
    alreadyClaimed: string;
    openSeaTab: string;
    freshTab: string;
  };
  leadImport: {
    title: string;
    chooseFile: string;
    supportedColumnsHint: string;
    parsing: string;
    rowsParsed: string;
    parseError: string;
    assignmentMode: string;
    modeSingleEmployee: string;
    modeRoundRobin: string;
    modeOpenC: string;
    selectEmployees: string;
    uploadButton: string;
    resultTitle: string;
    totalRows: string;
    imported: string;
    updated: string;
    skipped: string;
    invalid: string;
    errorReportTitle: string;
    rowLabel: string;
  };
  distribute: {
    title: string;
    description: string;
    selectEmployees: string;
    poolCount: string;
    distributeButton: string;
    confirmTitle: string;
    confirmDesc: string;
    successMessage: string;
    noLeadsInPool: string;
  };
  adminDashboard: {
    title: string;
    totalLeads: string;
    openPool: string;
    activeEmployees: string;
    activeTeamLeaders: string;
    freshLeads: string;
    newLeadsToday: string;
    salesToday: string;
    callsToday: string;
    callsThisMonth: string;
    closedThisMonth: string;
    conversionRate: string;
    overdueFollowups: string;
  };
  salesDashboard: {
    title: string;
    callsToday: string;
    callsThisMonth: string;
    salesThisMonth: string;
    activeLeads: string;
    targetProgress: string;
    noTarget: string;
    dueToday: string;
    noDueToday: string;
    overdue: string;
    dueTodayLabel: string;
  };
  teamLeaderDashboard: {
    title: string;
    teamSize: string;
    callsTodayTotal: string;
    salesThisMonthTotal: string;
    avgProgress: string;
    leaderboardTitle: string;
    rankLabel: string;
  };
  auditLog: {
    title: string;
    filterAllActions: string;
    filterAllActors: string;
    dateFrom: string;
    dateTo: string;
    clearFilters: string;
    columnTime: string;
    columnActor: string;
    columnRole: string;
    columnAction: string;
    columnEntity: string;
    systemActor: string;
    empty: string;
    actionLabels: {
      LOGIN: string;
      LOGIN_FAILED: string;
      LOGIN_RATE_LIMITED: string;
      LOGOUT: string;
      PASSWORD_CHANGED: string;
      EMPLOYEE_CREATED: string;
      EMPLOYEE_UPDATED: string;
      EMPLOYEE_DEACTIVATED: string;
      EMPLOYEE_REACTIVATED: string;
      TEAM_LEADER_CREATED: string;
      TEAM_LEADER_ASSIGNED: string;
      TEAM_LEADER_UNASSIGNED: string;
      LEAD_CREATED: string;
      LEAD_UPDATED: string;
      LEAD_DELETED: string;
      LEAD_TRANSFERRED: string;
      LEAD_PULLED_TO_OPENC: string;
      LEAD_RETURNED_FROM_OPENC: string;
      LEAD_CLAIMED: string;
      LEAD_CLAIM_FAILED: string;
      LEADS_IMPORTED: string;
      LEADS_DISTRIBUTED: string;
      LEADS_BULK_TRANSFERRED: string;
      LEADS_BULK_DELETED: string;
      LEADS_EXPORTED: string;
      WEBHOOK_CREATED: string;
      WEBHOOK_UPDATED: string;
      WEBHOOK_DELETED: string;
      TWO_FACTOR_ENABLED: string;
      TWO_FACTOR_DISABLED: string;
    };
  };
  notifications: {
    title: string;
    empty: string;
    markAllRead: string;
    leadAssignedOne: string;
    leadAssignedMany: string;
    teamAssignment: string;
  };
  webhooks: {
    title: string;
    description: string;
    create: string;
    createTitle: string;
    editTitle: string;
    url: string;
    urlPlaceholder: string;
    event: string;
    eventLeadCreated: string;
    eventLeadClosedSale: string;
    eventLeadAssigned: string;
    status: string;
    active: string;
    inactive: string;
    lastTriggered: string;
    lastStatus: string;
    never: string;
    deactivate: string;
    reactivate: string;
    deactivateConfirmTitle: string;
    deactivateConfirmDesc: string;
    reactivateConfirmTitle: string;
    reactivateConfirmDesc: string;
    deleteConfirmTitle: string;
    deleteConfirmDesc: string;
    createdSuccess: string;
    updatedSuccess: string;
    deletedSuccess: string;
    secretRevealTitle: string;
    secretRevealDesc: string;
    secretLabel: string;
    copySecret: string;
    copiedToClipboard: string;
    sendTestPing: string;
    testPingResultSuccess: string;
    testPingResultFailure: string;
    emptyState: string;
  };
  security: {
    title: string;
    description: string;
    twoFactorTitle: string;
    twoFactorDescription: string;
    enabled: string;
    disabled: string;
    enable: string;
    disable: string;
    setupTitle: string;
    setupScanInstruction: string;
    setupManualEntry: string;
    setupCodeLabel: string;
    confirmAndEnable: string;
    backupCodesTitle: string;
    backupCodesDesc: string;
    backupCodesSavedConfirm: string;
    copyCodes: string;
    codesCopied: string;
    disableTitle: string;
    disableDesc: string;
    enabledSuccess: string;
    disabledSuccess: string;
    changePasswordTitle: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    changePasswordButton: string;
    passwordChangedSuccess: string;
  };
}

const en: Dictionary = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    filter: "Filter",
    actions: "Actions",
    status: "Status",
    name: "Name",
    phone: "Phone Number",
    note: "Note",
    notes: "Notes",
    date: "Date",
    loading: "Loading...",
    noResults: "No results",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    page: "Page",
    of: "of",
    yes: "Yes",
    no: "No",
    all: "All",
    error: "Something went wrong",
    success: "Success",
    required: "Required",
    optional: "Optional",
    call: "Call",
    whatsapp: "WhatsApp",
    close: "Close",
    submit: "Submit",
    download: "Download",
    upload: "Upload",
    overdue: "Overdue",
    dueToday: "Due today",
  },
  auth: {
    login: "Log in",
    logout: "Log out",
    username: "Username",
    password: "Password",
    loginTitle: "Sign in to your account",
    loginSubtitle: "Sales CRM",
    invalidCredentials: "Invalid username or password",
    accountDeactivated: "This account has been deactivated",
    tooManyAttempts: "Too many failed attempts. Please wait a while and try again.",
    twoFactorTitle: "Two-factor authentication",
    twoFactorSubtitle: "Enter the code from your authenticator app",
    twoFactorCodeLabel: "Authentication code",
    twoFactorCodePlaceholder: "6-digit code or backup code",
    verifyCode: "Verify",
    invalidTwoFactorCode: "Invalid or expired code",
    backToLogin: "Back to login",
  },
  roles: {
    ADMIN: "Admin",
    TEAM_LEADER: "Team Leader",
    SALES_EMPLOYEE: "Sales Employee",
  },
  status: {
    NEW: "New",
    CONTACTED: "Contacted",
    INTERESTED: "Interested",
    NOT_INTERESTED: "Not Interested",
    CLOSED_SALE: "Closed Sale",
    CANCELLED: "Cancelled",
  },
  nav: {
    dashboard: "Dashboard",
    employees: "Employees",
    teamLeaders: "Team Leaders",
    leads: "Leads",
    importLeads: "Import Leads",
    distribute: "Distribute",
    openc: "OpenC",
    auditLog: "Audit Log",
    myLeads: "My Leads",
    settings: "Settings",
    webhooks: "Webhooks",
    security: "Security",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  locale: {
    ar: "Arabic",
    en: "English",
  },
  employees: {
    title: "Employees",
    create: "New Employee",
    createTitle: "Create Employee",
    editTitle: "Edit Employee",
    username: "Username",
    fullName: "Full Name",
    monthlyTarget: "Monthly Target",
    teamLeader: "Team Leader",
    noTeamLeader: "No team leader",
    activeStatus: "Account Status",
    active: "Active",
    inactive: "Inactive",
    deactivate: "Deactivate",
    reactivate: "Reactivate",
    deactivateConfirmTitle: "Deactivate this employee?",
    deactivateConfirmDesc: "They will no longer be able to log in. Their leads and history are preserved.",
    reactivateConfirmTitle: "Reactivate this employee?",
    reactivateConfirmDesc: "They will be able to log in again.",
    newPasswordOptional: "New Password (leave blank to keep current)",
    searchPlaceholder: "Search by name or username...",
    usernameTaken: "This username is already taken",
    createdSuccess: "Employee created",
    updatedSuccess: "Employee updated",
  },
  teamLeaders: {
    title: "Team Leaders",
    create: "New Team Leader",
    createTitle: "Create Team Leader",
    roster: "Assigned Employees",
    noEmployees: "No employees assigned yet",
    assignEmployee: "Assign Employee",
    selectEmployee: "Select an employee",
    unassign: "Unassign",
    unassignConfirmTitle: "Unassign this employee?",
    unassignConfirmDesc: "They will no longer appear in this team leader's roster.",
    assignedSuccess: "Employee assigned",
  },
  leads: {
    title: "Leads",
    create: "New Lead",
    createTitle: "Create Lead",
    customerName: "Customer Name",
    owner: "Owner",
    unowned: "Unassigned (OpenC)",
    noOwnerOption: "No owner (send to OpenC)",
    searchPlaceholder: "Search by name or phone...",
    statusFilterAll: "All statuses",
    lastContact: "Last Contact",
    nextFollowup: "Next Follow-up",
    phoneTaken: "A lead with this phone number already exists",
    createdSuccess: "Lead created",
    updateTitle: "Log a Call / Update Status",
    logCallNote: "Call Note",
    notePlaceholder: "What happened on this call?",
    saveUpdate: "Save Update",
    updateSuccess: "Lead updated",
    callHistory: "Call History",
    noNotesYet: "No calls logged yet",
    transfer: "Transfer",
    transferTitle: "Transfer Lead to Another Employee",
    transferSuccess: "Lead transferred",
    deleteConfirmTitle: "Delete this lead?",
    deleteConfirmDesc: "This permanently removes the lead and its call history. This cannot be undone.",
    deleteSuccess: "Lead deleted",
    backToList: "Back to Leads",
    pullToOpenC: "Pull to OpenC",
    pullToOpenCConfirmTitle: "Pull this lead into OpenC?",
    pullToOpenCConfirmDesc: "It will be unassigned. If it has no call notes yet, it becomes a Fresh Lead for the admin to redistribute; if it already has notes, it becomes visible to employees in the OpenC re-engagement pool.",
    pullToOpenCSuccess: "Lead pulled to OpenC",
    selectedCount: "selected",
    clearSelection: "Clear",
    bulkTransfer: "Bulk Transfer",
    bulkTransferTitle: "Transfer Selected Leads to Another Employee",
    bulkTransferSuccess: "Leads transferred",
    bulkDelete: "Bulk Delete",
    bulkDeleteConfirmTitle: "Delete selected leads?",
    bulkDeleteConfirmDesc:
      "This permanently removes all selected leads and their call history. This cannot be undone.",
    bulkDeleteSuccess: "Leads deleted",
    exportCsv: "Export CSV",
    tableView: "Table",
    kanbanView: "Kanban",
    moreInStatus: "more — view in table",
    tags: "Tags",
    addTagPlaceholder: "Add a tag and press Enter",
    savePreset: "Save filters",
    presetNameLabel: "Preset name",
    presetNamePlaceholder: "e.g. Hot leads this week",
    noPresets: "No saved presets yet",
  },
  openc: {
    title: "OpenC Pool",
    searchPlaceholder: "Search by name...",
    pulledAt: "Pulled to Pool At",
    empty: "The OpenC pool is empty",
    claim: "Claim",
    claimSuccess: "Lead claimed",
    alreadyClaimed: "This lead was already claimed by someone else",
    openSeaTab: "Open Sea (has notes)",
    freshTab: "Fresh (no notes)",
  },
  leadImport: {
    title: "Import Leads",
    chooseFile: "Choose a CSV or Excel file",
    supportedColumnsHint:
      "Supported columns: Name, Phone Number, Status, Note, Last Call Date, Next Follow-up Date. Only Name and Phone are required.",
    parsing: "Parsing file...",
    rowsParsed: "rows ready to import",
    parseError: "Couldn't read this file. Make sure it has name and phone columns.",
    assignmentMode: "Assign new leads to",
    modeSingleEmployee: "One employee",
    modeRoundRobin: "Split evenly across employees",
    modeOpenC: "Send to OpenC pool",
    selectEmployees: "Select employees",
    uploadButton: "Import",
    resultTitle: "Import Results",
    totalRows: "Total Rows",
    imported: "Imported",
    updated: "Updated",
    skipped: "Skipped (duplicates)",
    invalid: "Invalid",
    errorReportTitle: "Rows that couldn't be imported",
    rowLabel: "Row",
  },
  distribute: {
    title: "Distribute Fresh Leads",
    description: "Split every Fresh lead (never contacted, unassigned) evenly across the employees you select below. This does not include OpenC leads — those are claimed directly by employees.",
    selectEmployees: "Select employees",
    poolCount: "Fresh leads waiting to be distributed",
    distributeButton: "Distribute",
    confirmTitle: "Distribute Fresh leads now?",
    confirmDesc: "Every unassigned, never-contacted lead will be split evenly across the selected employees.",
    successMessage: "leads distributed",
    noLeadsInPool: "No Fresh leads waiting to be distributed right now",
  },
  adminDashboard: {
    title: "Overview",
    totalLeads: "Total Leads",
    openPool: "Leads in OpenC Pool",
    activeEmployees: "Active Employees",
    activeTeamLeaders: "Active Team Leaders",
    freshLeads: "Fresh Leads",
    newLeadsToday: "New Leads Today",
    salesToday: "Sales Today",
    callsToday: "Calls Today",
    callsThisMonth: "Calls This Month",
    closedThisMonth: "Sales This Month",
    conversionRate: "Conversion Rate",
    overdueFollowups: "Overdue Follow-ups",
  },
  salesDashboard: {
    title: "Overview",
    callsToday: "Calls Today",
    callsThisMonth: "Calls This Month",
    salesThisMonth: "Sales This Month",
    activeLeads: "Active Leads",
    targetProgress: "Target Progress",
    noTarget: "No target set",
    dueToday: "Follow-ups Due Today",
    noDueToday: "No follow-ups due today",
    overdue: "Overdue",
    dueTodayLabel: "Today",
  },
  teamLeaderDashboard: {
    title: "Team Overview",
    teamSize: "Team Size",
    callsTodayTotal: "Team Calls Today",
    salesThisMonthTotal: "Team Sales This Month",
    avgProgress: "Average Target Progress",
    leaderboardTitle: "Leaderboard",
    rankLabel: "Rank",
  },
  auditLog: {
    title: "Audit Log",
    filterAllActions: "All actions",
    filterAllActors: "All users",
    dateFrom: "From",
    dateTo: "To",
    clearFilters: "Clear filters",
    columnTime: "Time",
    columnActor: "User",
    columnRole: "Role",
    columnAction: "Action",
    columnEntity: "Details",
    systemActor: "System",
    empty: "No activity recorded yet",
    actionLabels: {
      LOGIN: "Logged in",
      LOGIN_FAILED: "Failed login attempt",
      LOGIN_RATE_LIMITED: "Login blocked (too many attempts)",
      LOGOUT: "Logged out",
      PASSWORD_CHANGED: "Password changed",
      EMPLOYEE_CREATED: "Employee created",
      EMPLOYEE_UPDATED: "Employee updated",
      EMPLOYEE_DEACTIVATED: "Employee deactivated",
      EMPLOYEE_REACTIVATED: "Employee reactivated",
      TEAM_LEADER_CREATED: "Team Leader created",
      TEAM_LEADER_ASSIGNED: "Employee assigned to Team Leader",
      TEAM_LEADER_UNASSIGNED: "Employee unassigned from Team Leader",
      LEAD_CREATED: "Lead created",
      LEAD_UPDATED: "Lead updated",
      LEAD_DELETED: "Lead deleted",
      LEAD_TRANSFERRED: "Lead transferred",
      LEAD_PULLED_TO_OPENC: "Lead pulled to OpenC",
      LEAD_RETURNED_FROM_OPENC: "Lead returned from OpenC",
      LEAD_CLAIMED: "Lead claimed from OpenC",
      LEAD_CLAIM_FAILED: "Failed claim attempt",
      LEADS_IMPORTED: "Leads imported",
      LEADS_DISTRIBUTED: "Leads distributed",
      LEADS_BULK_TRANSFERRED: "Leads bulk transferred",
      LEADS_BULK_DELETED: "Leads bulk deleted",
      LEADS_EXPORTED: "Leads exported",
      WEBHOOK_CREATED: "Webhook created",
      WEBHOOK_UPDATED: "Webhook updated",
      WEBHOOK_DELETED: "Webhook deleted",
      TWO_FACTOR_ENABLED: "Two-factor authentication enabled",
      TWO_FACTOR_DISABLED: "Two-factor authentication disabled",
    },
  },
  notifications: {
    title: "Notifications",
    empty: "No notifications yet",
    markAllRead: "Mark all as read",
    leadAssignedOne: "New lead assigned:",
    leadAssignedMany: "new leads assigned to you",
    teamAssignment: "joined your team",
  },
  webhooks: {
    title: "Webhooks",
    description: "Send a signed HTTP POST to your own systems when key events happen in the CRM.",
    create: "Add webhook",
    createTitle: "Add webhook",
    editTitle: "Edit webhook",
    url: "Endpoint URL",
    urlPlaceholder: "https://example.com/webhooks/crm",
    event: "Event",
    eventLeadCreated: "Lead created",
    eventLeadClosedSale: "Lead closed (sale)",
    eventLeadAssigned: "Lead assigned",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    lastTriggered: "Last triggered",
    lastStatus: "Last result",
    never: "Never",
    deactivate: "Deactivate",
    reactivate: "Reactivate",
    deactivateConfirmTitle: "Deactivate this webhook?",
    deactivateConfirmDesc: "It will stop receiving events until reactivated.",
    reactivateConfirmTitle: "Reactivate this webhook?",
    reactivateConfirmDesc: "It will start receiving events again.",
    deleteConfirmTitle: "Delete this webhook?",
    deleteConfirmDesc: "This cannot be undone. The endpoint will stop receiving events immediately.",
    createdSuccess: "Webhook created",
    updatedSuccess: "Webhook updated",
    deletedSuccess: "Webhook deleted",
    secretRevealTitle: "Webhook created",
    secretRevealDesc: "Copy this signing secret now — it won't be shown again. Use it to verify the X-Webhook-Signature header (HMAC-SHA256).",
    secretLabel: "Signing secret",
    copySecret: "Copy",
    copiedToClipboard: "Copied to clipboard",
    sendTestPing: "Send test ping",
    testPingResultSuccess: "Test ping delivered successfully",
    testPingResultFailure: "Test ping failed:",
    emptyState: "No webhooks configured yet.",
  },
  security: {
    title: "Security",
    description: "Manage extra protection for your admin account.",
    twoFactorTitle: "Two-factor authentication",
    twoFactorDescription: "Require a one-time code from an authenticator app when logging in.",
    enabled: "Enabled",
    disabled: "Disabled",
    enable: "Enable 2FA",
    disable: "Disable 2FA",
    setupTitle: "Set up two-factor authentication",
    setupScanInstruction: "Scan this QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.).",
    setupManualEntry: "Or enter this code manually:",
    setupCodeLabel: "Enter the 6-digit code from your app",
    confirmAndEnable: "Confirm and enable",
    backupCodesTitle: "Save your backup codes",
    backupCodesDesc: "Each code can be used once to sign in if you lose access to your authenticator app. Save them somewhere safe — they won't be shown again.",
    backupCodesSavedConfirm: "I've saved these codes",
    copyCodes: "Copy codes",
    codesCopied: "Backup codes copied to clipboard",
    disableTitle: "Disable two-factor authentication",
    disableDesc: "Enter your password to confirm. You'll be able to log in with just your password afterward.",
    enabledSuccess: "Two-factor authentication enabled",
    disabledSuccess: "Two-factor authentication disabled",
    changePasswordTitle: "Change password",
    currentPasswordLabel: "Current password",
    newPasswordLabel: "New password (8+ characters)",
    changePasswordButton: "Change password",
    passwordChangedSuccess: "Password changed",
  },
};

export default en;

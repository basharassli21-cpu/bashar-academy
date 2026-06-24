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
    STUDENT: string;
  };
  academy: {
    title: string;
    subtitle: string;
    myCourses: string;
    allCourses: string;
    continueLearning: string;
    completed: string;
    inProgress: string;
    notStarted: string;
    courseDetails: string;
    startCourse: string;
    resumeCourse: string;
    lessons: string;
    modules: string;
    resources: string;
    notes: string;
    comments: string;
    quizzes: string;
    certificate: string;
    bookmark: string;
    downloadResource: string;
    markComplete: string;
    nextLesson: string;
    prevLesson: string;
    bookConsultation: string;
    myBookings: string;
    availableSlots: string;
    noSlots: string;
    students: string;
    instructors: string;
    level: string;
    duration: string;
    lectures: string;
    price: string;
    free: string;
    enrolled: string;
    popular: string;
  };
  status: {
    NEW: string;
    CONTACTED: string;
    INTERESTED: string;
    NOT_INTERESTED: string;
    CLOSED_SALE: string;
    CANCELLED: string;
  };
  pipeline: {
    title: string;
    description: string;
  };
  trend: {
    adminTitle: string;
    adminDescription: string;
    teamTitle: string;
    teamDescription: string;
    myTitle: string;
    myDescription: string;
    employeeTitle: string;
    employeeDescription: string;
    newLeadsLabel: string;
    closedSalesLabel: string;
    callsLabel: string;
    salesLabel: string;
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
    errorLog: string;
    myLeads: string;
    settings: string;
    generalSettings: string;
    webhooks: string;
    security: string;
    trash: string;
    workQueue: string;
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
    quickStatusChangeNote: string;
    quickStatusChangeSuccess: string;
    quickRepliesLabel: string;
  };
  leadScore: {
    bandLabels: {
      hot: string;
      warm: string;
      cold: string;
    };
    reasonLabels: {
      STATUS_INTERESTED: string;
      STATUS_CONTACTED: string;
      STATUS_NEW: string;
      FOLLOWUP_OVERDUE: string;
      FOLLOWUP_DUE_TODAY: string;
      FOLLOWUP_DUE_SOON: string;
      NO_FOLLOWUP_SCHEDULED: string;
      CONTACTED_RECENTLY: string;
      CONTACT_STALE: string;
      NEVER_CONTACTED_AGING: string;
    };
  };
  leadNextAction: {
    messages: {
      CALL_FIRST_CONTACT: string;
      CALL_OVERDUE_FOLLOWUP: string;
      CALL_DUE_TODAY: string;
      SCHEDULE_FOLLOWUP: string;
      RE_ENGAGE_STALE: string;
      WAIT_FOLLOWUP_SCHEDULED: string;
    };
    shortLabels: {
      CALL_FIRST_CONTACT: string;
      CALL_OVERDUE_FOLLOWUP: string;
      CALL_DUE_TODAY: string;
      SCHEDULE_FOLLOWUP: string;
      RE_ENGAGE_STALE: string;
      WAIT_FOLLOWUP_SCHEDULED: string;
    };
  };
  workQueue: {
    title: string;
    description: string;
    empty: string;
  };
  callNoteTemplates: {
    NO_ANSWER: string;
    VOICEMAIL_LEFT: string;
    WRONG_NUMBER: string;
    ASKED_CALLBACK_LATER: string;
    REQUESTED_MORE_INFO: string;
    SENT_WHATSAPP_INFO: string;
    REQUESTED_QUOTE: string;
    NOT_INTERESTED_PRICE: string;
    NOT_INTERESTED_NO_NEED: string;
    DO_NOT_CALL_AGAIN: string;
    ALREADY_CUSTOMER: string;
    PAYMENT_CONFIRMED: string;
    CUSTOMER_CANCELLED: string;
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
    paceOnTrack: string;
    paceSlightlyBehind: string;
    paceBehind: string;
  };
  teamLeaderDashboard: {
    title: string;
    teamSize: string;
    callsTodayTotal: string;
    salesThisMonthTotal: string;
    avgProgress: string;
    leaderboardTitle: string;
    rankLabel: string;
    streakLabel: string;
  };
  gamification: {
    badgeLabels: {
      TOP_PERFORMER: string;
      TARGET_HIT: string;
      POWER_CALLER: string;
    };
    streakDaysSuffix: string;
    streakStatCardLabel: string;
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
      SETTINGS_UPDATED: string;
      LEAD_RESTORED: string;
      LEAD_PERMANENTLY_DELETED: string;
    };
    anomalies: {
      title: string;
      description: string;
      allClear: string;
      severityLabels: {
        high: string;
        medium: string;
        low: string;
      };
      messages: {
        LOGIN_BRUTE_FORCE: string;
        LOGIN_RATE_LIMITED: string;
        OFF_HOURS_SENSITIVE_ACTION: string;
        LARGE_BULK_DELETE: string;
        LARGE_EXPORT: string;
        PERMANENT_DELETE: string;
        TWO_FACTOR_DISABLED: string;
        HIGH_ACTIVITY_VOLUME: string;
      };
    };
  };
  errorLog: {
    title: string;
    description: string;
    columnTime: string;
    columnMessage: string;
    showStack: string;
    hideStack: string;
    empty: string;
  };
  notifications: {
    title: string;
    empty: string;
    markAllRead: string;
    leadAssignedOne: string;
    leadAssignedMany: string;
    teamAssignment: string;
    teamAssignmentMany: string;
    preferencesButtonLabel: string;
    preferencesTitle: string;
    muteLabel: string;
    muteHint: string;
    digestLabel: string;
    digestHint: string;
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
  settings: {
    title: string;
    description: string;
    defaultCountryCodeLabel: string;
    defaultCountryCodeHint: string;
    savedSuccess: string;
  };
  leadsTrash: {
    title: string;
    description: string;
    columnDeletedAt: string;
    columnDeletedBy: string;
    restoreButton: string;
    restoreSuccess: string;
    permanentDeleteButton: string;
    permanentDeleteConfirmTitle: string;
    permanentDeleteConfirmDesc: string;
    permanentDeleteSuccess: string;
    empty: string;
  };
  commandPalette: {
    placeholder: string;
    noResults: string;
    navigationGroup: string;
    leadsGroup: string;
    openButtonLabel: string;
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
    STUDENT: "Student",
  },
  status: {
    NEW: "New",
    CONTACTED: "Contacted",
    INTERESTED: "Interested",
    NOT_INTERESTED: "Not Interested",
    CLOSED_SALE: "Closed Sale",
    CANCELLED: "Cancelled",
  },
  pipeline: {
    title: "Pipeline",
    description: "Number of leads currently in each stage",
  },
  trend: {
    adminTitle: "Trends (Last 14 Days)",
    adminDescription: "Daily new leads vs. closed sales",
    teamTitle: "Team Trends (Last 14 Days)",
    teamDescription: "Daily team calls vs. team sales",
    myTitle: "My Trends (Last 14 Days)",
    myDescription: "Your daily calls vs. your sales",
    employeeTitle: "Performance History (Last 14 Days)",
    employeeDescription: "Daily calls vs. sales",
    newLeadsLabel: "New Leads",
    closedSalesLabel: "Closed Sales",
    callsLabel: "Calls",
    salesLabel: "Sales",
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
    errorLog: "Error Log",
    myLeads: "My Leads",
    settings: "Settings",
    generalSettings: "General",
    webhooks: "Webhooks",
    security: "Security",
    trash: "Trash",
    workQueue: "Today's Queue",
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
    deleteConfirmDesc:
      "This moves the lead to Trash. You can restore it later, or delete it permanently from the Trash page.",
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
      "This moves all selected leads to Trash. You can restore them later, or delete them permanently from the Trash page.",
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
    quickStatusChangeNote: "Status changed via quick update",
    quickStatusChangeSuccess: "Status updated",
    quickRepliesLabel: "Quick replies:",
  },
  leadScore: {
    bandLabels: {
      hot: "Hot",
      warm: "Warm",
      cold: "Cold",
    },
    reasonLabels: {
      STATUS_INTERESTED: "Marked as interested",
      STATUS_CONTACTED: "Already in contact",
      STATUS_NEW: "New, not yet contacted",
      FOLLOWUP_OVERDUE: "Follow-up is overdue",
      FOLLOWUP_DUE_TODAY: "Follow-up due today",
      FOLLOWUP_DUE_SOON: "Follow-up due within 3 days",
      NO_FOLLOWUP_SCHEDULED: "No follow-up scheduled",
      CONTACTED_RECENTLY: "Contacted in the last 2 days",
      CONTACT_STALE: "Not contacted in over a week",
      NEVER_CONTACTED_AGING: "Sitting uncontacted for days",
    },
  },
  leadNextAction: {
    messages: {
      CALL_FIRST_CONTACT: "Call now — this is a new lead that hasn't been contacted yet.",
      CALL_OVERDUE_FOLLOWUP: "Call now — the scheduled follow-up is overdue.",
      CALL_DUE_TODAY: "Call today — a follow-up is scheduled for today.",
      SCHEDULE_FOLLOWUP: "Schedule a follow-up date so this lead doesn't fall through the cracks.",
      RE_ENGAGE_STALE: "Re-engage — it's been over a week since the last contact.",
      WAIT_FOLLOWUP_SCHEDULED: "No action needed right now — the next follow-up is already scheduled.",
    },
    shortLabels: {
      CALL_FIRST_CONTACT: "First contact",
      CALL_OVERDUE_FOLLOWUP: "Overdue",
      CALL_DUE_TODAY: "Due today",
      SCHEDULE_FOLLOWUP: "Needs follow-up",
      RE_ENGAGE_STALE: "Going cold",
      WAIT_FOLLOWUP_SCHEDULED: "Scheduled",
    },
  },
  workQueue: {
    title: "Today's Work Queue",
    description: "Leads that need your attention right now, most urgent first.",
    empty: "You're all caught up — no leads need action right now.",
  },
  callNoteTemplates: {
    NO_ANSWER: "No answer",
    VOICEMAIL_LEFT: "Left a voicemail",
    WRONG_NUMBER: "Wrong number",
    ASKED_CALLBACK_LATER: "Asked to call back later",
    REQUESTED_MORE_INFO: "Requested more information",
    SENT_WHATSAPP_INFO: "Sent details via WhatsApp",
    REQUESTED_QUOTE: "Requested a price quote",
    NOT_INTERESTED_PRICE: "Not interested — price too high",
    NOT_INTERESTED_NO_NEED: "Not interested — no current need",
    DO_NOT_CALL_AGAIN: "Asked not to be contacted again",
    ALREADY_CUSTOMER: "Already a customer",
    PAYMENT_CONFIRMED: "Payment confirmed",
    CUSTOMER_CANCELLED: "Customer cancelled",
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
    paceOnTrack: "On track",
    paceSlightlyBehind: "Slightly behind pace",
    paceBehind: "Behind pace",
  },
  teamLeaderDashboard: {
    title: "Team Overview",
    teamSize: "Team Size",
    callsTodayTotal: "Team Calls Today",
    salesThisMonthTotal: "Team Sales This Month",
    avgProgress: "Average Target Progress",
    leaderboardTitle: "Leaderboard",
    rankLabel: "Rank",
    streakLabel: "Streak",
  },
  gamification: {
    badgeLabels: {
      TOP_PERFORMER: "Top performer this month — #1 on the leaderboard",
      TARGET_HIT: "Hit 100% of monthly target",
      POWER_CALLER: "Power caller — 10+ calls logged today",
    },
    streakDaysSuffix: "day streak of logging at least one call",
    streakStatCardLabel: "Current Streak",
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
      SETTINGS_UPDATED: "Settings updated",
      LEAD_RESTORED: "Lead restored",
      LEAD_PERMANENTLY_DELETED: "Lead permanently deleted",
    },
    anomalies: {
      title: "Unusual Activity",
      description: "Rule-based checks over the last 7 days.",
      allClear: "No unusual activity detected in the last 7 days.",
      severityLabels: {
        high: "High",
        medium: "Medium",
        low: "Low",
      },
      messages: {
        LOGIN_BRUTE_FORCE: "failed login attempts in a short window",
        LOGIN_RATE_LIMITED: "Login blocked after repeated failures",
        OFF_HOURS_SENSITIVE_ACTION: "performed a sensitive action outside business hours:",
        LARGE_BULK_DELETE: "bulk-deleted an unusually large number of leads",
        LARGE_EXPORT: "exported an unusually large number of leads",
        PERMANENT_DELETE: "permanently deleted a lead",
        TWO_FACTOR_DISABLED: "disabled two-factor authentication",
        HIGH_ACTIVITY_VOLUME: "actions within one hour — unusually high volume",
      },
    },
  },
  errorLog: {
    title: "Error Log",
    description: "Unexpected server errors, most recent first.",
    columnTime: "Time",
    columnMessage: "Message",
    showStack: "Show details",
    hideStack: "Hide details",
    empty: "No errors recorded",
  },
  notifications: {
    title: "Notifications",
    empty: "No notifications yet",
    markAllRead: "Mark all as read",
    leadAssignedOne: "New lead assigned:",
    leadAssignedMany: "new leads assigned to you",
    teamAssignment: "joined your team",
    teamAssignmentMany: "employees joined your team",
    preferencesButtonLabel: "Notification settings",
    preferencesTitle: "Notification Preferences",
    muteLabel: "Mute notifications",
    muteHint: "Stop new notifications from being created for you.",
    digestLabel: "Group into a digest",
    digestHint: "Combine unread notifications of the same type into a single summary instead of listing each one.",
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
    description: "Manage extra protection for your account.",
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
  settings: {
    title: "General Settings",
    description: "System-wide configuration that applies across the CRM.",
    defaultCountryCodeLabel: "Default country code",
    defaultCountryCodeHint:
      "Used to complete phone numbers entered without a country code, for click-to-call and WhatsApp links (e.g. 962 for Jordan).",
    savedSuccess: "Settings saved",
  },
  leadsTrash: {
    title: "Trash",
    description: "Leads moved to Trash. Restore them or delete them permanently.",
    columnDeletedAt: "Deleted At",
    columnDeletedBy: "Deleted By",
    restoreButton: "Restore",
    restoreSuccess: "Lead restored",
    permanentDeleteButton: "Delete Permanently",
    permanentDeleteConfirmTitle: "Permanently delete this lead?",
    permanentDeleteConfirmDesc:
      "This cannot be undone. The lead and its full call history will be erased forever.",
    permanentDeleteSuccess: "Lead permanently deleted",
    empty: "Trash is empty",
  },
  commandPalette: {
    placeholder: "Search or jump to...",
    noResults: "No results found",
    navigationGroup: "Navigation",
    leadsGroup: "Leads",
    openButtonLabel: "Search",
  },
  academy: {
    title: "Academy",
    subtitle: "Learn eBay e-commerce",
    myCourses: "My Courses",
    allCourses: "All Courses",
    continueLearning: "Continue Learning",
    completed: "Completed",
    inProgress: "In Progress",
    notStarted: "Not Started",
    courseDetails: "Course Details",
    startCourse: "Start Course",
    resumeCourse: "Resume Course",
    lessons: "Lessons",
    modules: "Modules",
    resources: "Resources",
    notes: "Notes",
    comments: "Comments",
    quizzes: "Quizzes",
    certificate: "Certificate",
    bookConsultation: "Book a Consultation",
    myBookings: "My Bookings",
    availableSlots: "Available Slots",
    noSlots: "No available slots",
    students: "Students",
    instructors: "Instructors",
    level: "Level",
    duration: "Duration",
    lectures: "Lectures",
    price: "Price",
    free: "Free",
    enrolled: "Enrolled",
    popular: "Popular",
    bookmark: "Bookmark",
    downloadResource: "Download Resource",
    markComplete: "Mark Complete",
    nextLesson: "Next Lesson",
    prevLesson: "Previous Lesson",
  },
};

export default en;

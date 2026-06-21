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
  };
  openc: {
    title: string;
    searchPlaceholder: string;
    pulledAt: string;
    empty: string;
    claim: string;
    claimSuccess: string;
    alreadyClaimed: string;
  };
  leadImport: {
    title: string;
    chooseFile: string;
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
    newLeadsToday: string;
    callsToday: string;
    closedThisMonth: string;
    conversionRate: string;
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
  };
  teamLeaderDashboard: {
    title: string;
    teamSize: string;
    callsTodayTotal: string;
    salesThisMonthTotal: string;
    avgProgress: string;
    rosterTitle: string;
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
    close: "Close",
    submit: "Submit",
    download: "Download",
    upload: "Upload",
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
    pullToOpenCConfirmDesc: "It will be unassigned and become visible to all employees in the shared pool.",
    pullToOpenCSuccess: "Lead pulled to OpenC",
  },
  openc: {
    title: "OpenC Pool",
    searchPlaceholder: "Search by name...",
    pulledAt: "Pulled to Pool At",
    empty: "The OpenC pool is empty",
    claim: "Claim",
    claimSuccess: "Lead claimed",
    alreadyClaimed: "This lead was already claimed by someone else",
  },
  leadImport: {
    title: "Import Leads",
    chooseFile: "Choose a CSV or Excel file",
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
    title: "Distribute OpenC Pool",
    description: "Split every lead currently sitting in the OpenC pool evenly across the employees you select below.",
    selectEmployees: "Select employees",
    poolCount: "Leads currently in the pool",
    distributeButton: "Distribute",
    confirmTitle: "Distribute the OpenC pool now?",
    confirmDesc: "Every unassigned lead will be split evenly across the selected employees.",
    successMessage: "leads distributed",
    noLeadsInPool: "The OpenC pool is empty, nothing to distribute",
  },
  adminDashboard: {
    title: "Overview",
    totalLeads: "Total Leads",
    openPool: "Leads in OpenC Pool",
    activeEmployees: "Active Employees",
    activeTeamLeaders: "Active Team Leaders",
    newLeadsToday: "New Leads Today",
    callsToday: "Calls Today",
    closedThisMonth: "Sales This Month",
    conversionRate: "Conversion Rate",
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
  },
  teamLeaderDashboard: {
    title: "Team Overview",
    teamSize: "Team Size",
    callsTodayTotal: "Team Calls Today",
    salesThisMonthTotal: "Team Sales This Month",
    avgProgress: "Average Target Progress",
    rosterTitle: "Team Members",
  },
};

export default en;

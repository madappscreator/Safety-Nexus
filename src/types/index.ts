// User Types
export type UserRole =
  | "platform_admin"
  | "company_admin"
  | "hse_manager"
  | "hse_supervisor"
  | "safety_officer"
  | "shift_incharge"
  | "shift_manager"
  | "line_incharge"
  | "line_manager"
  | "supervisor"
  | "employee"
  | "worker"
  | "contractor";

// Role hierarchy for approvals (higher number = higher authority)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  platform_admin: 100,
  company_admin: 90,
  hse_manager: 80,
  hse_supervisor: 75,
  safety_officer: 70,
  shift_manager: 60,
  shift_incharge: 55,
  line_manager: 50,
  line_incharge: 45,
  supervisor: 40,
  employee: 20,
  worker: 10,
  contractor: 5,
};

// Roles that can approve permits at each stage
export const PERMIT_APPROVAL_ROLES = {
  stage1: ["supervisor"] as UserRole[],
  stage2: ["shift_incharge", "shift_manager", "line_incharge", "line_manager"] as UserRole[],
  stage3: ["hse_supervisor", "hse_manager", "safety_officer"] as UserRole[],
};

export interface User {
  uid: string;
  email: string;
  displayName: string;
  companyId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastSeen: Date;
  profileUrl?: string;
  phone?: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  code: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  subscription: {
    plan: "starter" | "professional" | "enterprise" | "internal";
    expiryDate: Date;
    userLimit: number;
  };
  createdAt: Date;
  settings?: CompanySettings;
}

export interface CompanySettings {
  timezone?: string;
  dateFormat?: string;
  allowSelfRegister?: boolean;
  emergencyContacts?: { name: string; phone: string; email: string }[];
  workflowSettings?: {
    permitApprovalLevels: number;
    incidentAutoNotify: boolean;
  };
}

// Permit Types
export type PermitType = "hot_work" | "confined_space" | "work_at_height" | "electrical" | "excavation" | "lifting" | "chemical" | "general";
export type PermitStatus = "draft" | "pending_supervisor" | "pending_incharge" | "pending_hse" | "approved" | "active" | "suspended" | "closed" | "rejected";
export type ApprovalStage = "supervisor" | "incharge" | "hse";

export interface PermitApproval {
  stage: ApprovalStage;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  status: "pending" | "approved" | "rejected";
  remarks?: string;
  guidelines?: string;
  observations?: string;
  approvedAt?: Date;
}

export interface PermitWorker {
  uid: string;
  name: string;
  role: string;
  phone?: string;
}

export interface PermitDocument {
  name: string;
  url: string;
  type: "swms" | "medical_fitness" | "safety_audit" | "equipment_certificate" | "location_photo" | "tool_reference" | "other";
  expiryDate?: Date;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface PermitAsset {
  assetId: string;
  name: string;
  assetCode: string;
  certificateUrl?: string;
  certificateExpiry?: Date;
  validated: boolean;
  validatedBy?: string;
  validatedAt?: Date;
}

export interface Permit {
  id: string;
  permitId: string; // PTW-2024-001
  companyId: string;
  type: PermitType;
  title: string;
  description: string;
  location: string;
  workArea?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: PermitStatus;

  // Requester info
  requestedByUid: string;
  requestedBy: string;

  // Approval workflow
  supervisorId: string;
  supervisorName: string;
  approvals: PermitApproval[];
  currentApprovalStage: ApprovalStage;

  // Workers assigned to the permit
  workers: PermitWorker[];

  // Hazards and controls
  hazards: string[];
  controls: string;
  ppe: string[];

  // Documents and attachments
  documents: PermitDocument[];

  // Assets and equipment
  assets: PermitAsset[];

  // For critical/hazardous activities
  isCritical: boolean;
  swmsRequired: boolean;
  medicalFitnessRequired: boolean;

  // Closure
  closedByUid?: string;
  closedBy?: string;
  closedAt?: Date;
  closureRemarks?: string;
  closureObservations?: string;

  // Incidents linked to this permit
  incidentIds?: string[];

  createdAt: Date;
  updatedAt: Date;
}

// Incident Types
export type IncidentType = "near_miss" | "first_aid" | "minor" | "major" | "fatality";
export type IncidentStatus = "reported" | "investigating" | "pending_capa" | "closed";

export interface Incident {
  id: string;
  companyId: string;
  type: IncidentType;
  title: string;
  description: string;
  location: string;
  datetime: Date;
  status: IncidentStatus;
  reportedBy: string;
  reportedByName: string;
  injuredPersons?: { name: string; injury: string; treatment: string }[];
  witnesses?: string[];
  immediateActions?: string;
  rootCause?: string;
  fiveWhyAnalysis?: string[];
  attachments: { name: string; url: string; type: string }[];
  capaIds?: string[];
  gps?: { lat: number; lng: number };
  createdAt: Date;
  updatedAt: Date;
}

// CAPA Types
export interface CAPA {
  id: string;
  companyId: string;
  incidentId?: string;
  auditId?: string;
  type: "corrective" | "preventive";
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: Date;
  status: "open" | "in_progress" | "completed" | "overdue" | "verified";
  priority: "low" | "medium" | "high" | "critical";
  evidence?: { name: string; url: string }[];
  completedAt?: Date;
  verifiedBy?: string;
  createdAt: Date;
}

// Inspection/Audit Types
export interface Inspection {
  id: string;
  companyId: string;
  title: string;
  templateId: string;
  location: string;
  scheduledDate: Date;
  completedDate?: Date;
  inspector: string;
  inspectorName: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  score?: number;
  totalItems: number;
  passedItems: number;
  findings: Finding[];
  attachments: { name: string; url: string }[];
  createdAt: Date;
}

export interface Finding {
  id: string;
  checklistItem: string;
  status: "pass" | "fail" | "na";
  severity?: "low" | "medium" | "high" | "critical";
  description?: string;
  photo?: string;
  capaRequired: boolean;
  capaId?: string;
}

// Training Types
export interface Training {
  id: string;
  companyId: string;
  title: string;
  description: string;
  type: "mandatory" | "optional";
  duration: number; // in hours
  validityPeriod: number; // in months
  createdAt: Date;
}

export interface UserTraining {
  id: string;
  userId: string;
  trainingId: string;
  trainingTitle: string;
  completedDate: Date;
  expiryDate: Date;
  certificateUrl?: string;
  score?: number;
  status: "assigned" | "in_progress" | "completed" | "expired";
}

// Asset Types
export interface Asset {
  id: string;
  companyId: string;
  name: string;
  assetCode: string;
  category: string;
  location: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastInspection?: Date;
  nextInspection?: Date;
  status: "active" | "maintenance" | "retired" | "under_repair";
  qrCode?: string;
  documents: { name: string; url: string; expiryDate?: Date }[];
  createdAt: Date;
}

// Subscription & Billing Types
export type SubscriptionPlan = "starter" | "standard" | "enterprise" | "internal";
export type SubscriptionStatus = "active" | "expiring" | "expired" | "trial";
export type PaymentMode = "razorpay" | "stripe" | "bank_transfer" | "cheque" | "cash";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface SubscriptionPlanDetails {
  name: SubscriptionPlan;
  displayName: string;
  freeUsers: number;
  extraUserCost: number;
  yearlyPrice: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanDetails> = {
  starter: {
    name: "starter",
    displayName: "Starter",
    freeUsers: 50,
    extraUserCost: 500,
    yearlyPrice: 50000,
    features: [
      "Up to 50 users",
      "Permit Management",
      "Incident Reporting",
      "Basic Reports",
      "Email Support",
    ],
  },
  standard: {
    name: "standard",
    displayName: "Standard",
    freeUsers: 100,
    extraUserCost: 300,
    yearlyPrice: 120000,
    features: [
      "Up to 100 users",
      "All Starter features",
      "Training Management",
      "Audit & Inspections",
      "Advanced Analytics",
      "Priority Support",
    ],
  },
  enterprise: {
    name: "enterprise",
    displayName: "Enterprise",
    freeUsers: 500,
    extraUserCost: 200,
    yearlyPrice: 300000,
    features: [
      "Unlimited users",
      "All Standard features",
      "Custom Workflows",
      "API Access",
      "Dedicated Support",
      "On-premise Option",
    ],
  },
  internal: {
    name: "internal",
    displayName: "Internal",
    freeUsers: 9999,
    extraUserCost: 0,
    yearlyPrice: 0,
    features: ["Internal use only"],
  },
};

export interface BillingTransaction {
  id: string;
  tenantId: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
  period: string;
  paymentDate: Date;
  paymentMode: PaymentMode;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  remarks?: string;
  createdAt: Date;
}

export interface BillingInvoice {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  generatedOn: Date;
  dueDate: Date;
  pdfUrl?: string;
  status: InvoiceStatus;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  createdAt: Date;
}


export type UserRole = 'Customer' | 'Worker' | 'Admin';

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  content: string;
  date: string;
  images?: string[]; // Proof of work/screenshots uploads (Base64)
  reported?: boolean;
  reportReason?: string;
}

export interface WorkSample {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface DayAvailability {
  day: string; // e.g. "Monday", "Tuesday", etc.
  startTime: string; // e.g. "09:00"
  endTime: string; // e.g. "17:00"
  enabled: boolean;
  slots?: {
    time: string;
    available: boolean;
  }[];
}

export interface WorkerProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  profession: string;
  category: 'Developer' | 'Student' | 'Housewife' | 'Disabled' | 'Startup';
  bio: string;
  rating: number;
  reviews: Review[];
  pricePerHour: number;
  materialCosts: number;
  location: string;
  workSamples: WorkSample[];
  availability: DayAvailability[];
  earnings: number;
  workingHours: number;
  completedJobs: number;
  paymentDetails: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    payPalEmail?: string;
  };
  status?: 'Pending' | 'Active' | 'Deactivated' | 'Rejected';
  reported?: boolean;
  reportCount?: number;
  deactivated?: boolean;
}

export interface Booking {
  id: string;
  workerId: string;
  workerName: string;
  workerProfession: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Disputed' | 'Cancelled';
  totalCost: number;
  notes?: string;
  disputeReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  profession?: string; // only if Worker
  deactivated?: boolean;
  password?: string; // Stored user password for authentication
}

export interface SystemSettings {
  commissionFee: number; // e.g. 10 for 10%
  autoApproveWorkers: boolean;
  allowGuestBookings: boolean;
  announcementText: string;
  maintenanceMode: boolean;
}

export interface ReportItem {
  id: string;
  type: 'Profile' | 'Review' | 'Booking';
  targetId: string; // ID of the target
  reporterName: string;
  reason: string;
  date: string;
  details?: string;
  resolved: boolean;
}


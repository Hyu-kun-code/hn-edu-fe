export type PaymentStatus = "PAID" | "UNPAID" | "PARTIAL";

export interface Payment {
  id: string;
  studentId: string;
  classId: string;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export interface SalaryReport {
  tutorId: string;
  totalHours: number;
  hourlyRate: number;
  totalSalary: number;
  periodStart: string;
  periodEnd: string;
}

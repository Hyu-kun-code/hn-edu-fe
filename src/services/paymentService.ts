import { api } from "./api";
import type { Payment, SalaryReport } from "../types/payment.types";

export const paymentService = {
  getPayments: () => api.get<Payment[]>("/payments").then((res) => res.data),

  getSalaryReport: (tutorId: string) =>
    api.get<SalaryReport>(`/tutors/${tutorId}/salary`).then((res) => res.data),
};

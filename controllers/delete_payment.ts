import { deletePaymentById } from '../models/payments.js'
import { deleteDebtorsByPaymentId } from '../models/payment_debtors.js';

export async function deletePayment(paymentId: number){
  const deleteDebtors = await deleteDebtorsByPaymentId(paymentId);
  const deletePayment = await deletePaymentById(paymentId);
  return;
}
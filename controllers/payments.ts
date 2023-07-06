import { getGroupPayments } from '../models/payments.js'
import { getUserName } from '../models/users.js';
import { deletePaymentById } from '../models/payments.js'
import { deleteDebtorsByPaymentId } from '../models/payment_debtors.js';

export async function printPayments(groupId: number) {
  const results = [];
  const groupPayments = await getGroupPayments(groupId);
  for (const payment of groupPayments) {
    const paymentId = payment.id;
    const creditorId = payment.creditor_id;
    const [creditor] = await getUserName(creditorId);
    const creditorName = creditor.name;
    const paymentFormat = {
      paymentId: paymentId,
      creditorName: creditorName,
      amount: payment.amount,
      item: payment.item
    };
    results.push(paymentFormat);
  }
  return results;
}

export async function deletePayment(paymentId: number){
  const deleteDebtors = await deleteDebtorsByPaymentId(paymentId);
  const deletePayment = await deletePaymentById(paymentId);
  return;
}

export async function createPaymentcontroll(){
  
}
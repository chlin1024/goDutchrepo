import { createPayment,getGroupPayments } from '../models/payments.js'
import { getUserName } from '../models/users.js';
import { deletePaymentById } from '../models/payments.js'
import { createDebtors, deleteDebtorsByPaymentId } from '../models/payment_debtors.js';

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

export async function createPaymentcontrol(item: string, amount: number, creditor: number, groupId: number, numberOfDebtors: number, debtors: []){
  const insertPaymentId = await createPayment(item, amount, creditor, groupId, numberOfDebtors)
  await debtors.map((debtor : any) => createDebtors(insertPaymentId, debtor));
  return;
}
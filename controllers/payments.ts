import { createPayment, getGroupPayments, deletePaymentById } from '../models/payments.js';
import { getUserName } from '../models/users.js';
import { createDebtors, deleteDebtorsByPaymentId } from '../models/payment_debtors.js';

interface Payment {
  id: number,
  creditor_id: number,
  amount: number,
  item: string,
}

export async function printPayments(groupId: number) {
  const groupPayments = await getGroupPayments(groupId);
  const results = await Promise.all(groupPayments.map(async (payment: Payment) => {
    const paymentId = payment.id;
    const creditorId = payment.creditor_id;
    const [creditor] = await getUserName(creditorId);
    const creditorName = creditor.name;
    return {
      paymentId,
      creditorName,
      amount: payment.amount,
      item: payment.item,
    };
  }));
  return results;
}

export async function deletePayment(paymentId: number) {
  await deleteDebtorsByPaymentId(paymentId);
  await deletePaymentById(paymentId);
}

export async function createPaymentcontrol(
  item: string,
  amount: number,
  creditor: number,
  groupId: number,
  numberOfDebtors: number,
  debtors: [],
) {
  const insertPaymentId = await createPayment(item, amount, creditor, groupId, numberOfDebtors);
  await debtors.map((debtor : any) => createDebtors(insertPaymentId, debtor));
}

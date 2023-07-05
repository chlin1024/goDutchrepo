import { getGroupPayments } from '../models/payments.js'
import { getUserName } from '../models/users.js';

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
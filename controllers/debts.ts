import { getDebtors, countDebtors } from '../models/payment_debtors.js';
import { getPaymentDetails } from '../models/payments.js';

export async function debts(paymentId: number) {
  try {
    const debtsData: any[] = [];
    const [counts] = await countDebtors(paymentId);
    const [payment] = await getPaymentDetails(paymentId);
    const debtors = await getDebtors(paymentId);
    const numberOfDebtors = counts['COUNT(debtor_id)'];
    const creditor = payment.creditor_id;
    const { amount } = payment;
    const amountPerDebtor = Math.round(amount / numberOfDebtors);
    debtors.forEach((debtor : any) => {
      const debt = {
        paymentId,
        numberOfDebtors,
        total: amount,
        debtor: debtor.debtor_id,
        creditor,
        amount: amountPerDebtor,
      };
      debtsData.push(debt);
    });
    return debtsData;
  } catch (error) {
    return error;
  }
}

export default debts;

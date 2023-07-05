//import getDebtors from '../models/getDebtors.js'
//import countDebtors from '../models/countDebtors.js'
//import getPaymentIds from '../models/getPaymentIds.js'
//import getPaymentDetails from '../models/getPaymentDetails.js'
import { getDebtors, countDebtors} from '../models/payment_debtors.js'
import { getPaymentIds, getPaymentDetails }from '../models/payments.js'

export async function debts(paymentId: number) {
  try {
    const debts: any[] = [];
    const [counts] = await countDebtors(paymentId);
    const [payment] = await getPaymentDetails(paymentId);
    const debtors = await getDebtors(paymentId);
    const numberOfDebtors = counts['COUNT(debtor_id)'];
    const creditor = payment.creditor_id;
    const amount = payment.amount;
    const amountPerDebtor = Math.round(amount / numberOfDebtors);
    debtors.map((debtor : any) => {
      const debt = {
        paymentId: paymentId,
        numberOfDebtors: numberOfDebtors,
        total: amount,
        debtor: debtor.debtor_id,
        creditor: creditor,
        amount: amountPerDebtor
      }
      debts.push(debt);
    });
    return debts;
  } catch (error) {

  }
}

export default debts;
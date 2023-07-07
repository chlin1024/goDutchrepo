import { getPaymentIds } from '../models/payments.js';
import { debts } from './debts.js';

export async function calpersonalExpenseTotal(groupId: number, userId: number) {
  const payments = await getPaymentIds(groupId);
  const debtsRecords = await Promise.all(payments.map(async (payment : any) => {
    const debtRecord = await debts(payment.id);
    return debtRecord;
  }));
    const cleanDebtRecord = debtsRecords.flat();
    console.log('split2中cleanDebtRecord', cleanDebtRecord);
    const personalExpense = cleanDebtRecord.filter(debt => debt.debtor === userId);
    console.log(personalExpense);
    const personalExpenseTotal = personalExpense.reduce(
      (accumulator, expense) => accumulator + expense.amount, 0);
    return personalExpenseTotal;
}
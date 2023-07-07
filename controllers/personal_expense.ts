import { getPaymentIds, getPersonalPayments } from '../models/payments.js';
import { debts } from './debts.js'; 
import { getPersonalsettlements } from '../models/settlements.js';

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

export async function personalPaymentTotal(groupId: number, userId: number){
  const personalPayments = await getPersonalPayments(groupId, userId);
  const personalPaymentTotal = personalPayments.reduce(
    (accumulator: number, payment: {id: number, amount: number, item: string}) => accumulator + payment.amount, 0);
  return personalPaymentTotal;
}

export async function personalsettlementsTotal(groupId: number, userId: number){
  const personalsettlements = await getPersonalsettlements(groupId, userId);
  const personalsettlementTotal = personalsettlements.reduce(
    (accumulator: number, settlement: {id: number, payer_id: number, repay_at: number, amount: number}) => accumulator + settlement.amount, 0);
  return personalsettlementTotal;
}
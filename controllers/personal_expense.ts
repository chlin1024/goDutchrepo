/* eslint-disable max-len */
import { getPaymentIds, getPersonalPayments } from '../models/payments.js';
import { debts } from './debts.js';
import { getPersonalsettlements, getPersonalRepayments } from '../models/settlements.js';

export async function calpersonalExpenseTotal(groupId: number, userId: number) {
  const payments = await getPaymentIds(groupId);
  const debtsRecords = await Promise.all(
    payments.map(async (payment: any) => {
      const debtRecord = await debts(payment.id);
      return debtRecord;
    })
  );
  const cleanDebtRecord = debtsRecords.flat();
  const personalExpense = cleanDebtRecord.filter((debt) => debt.debtor === userId);
  const personalExpenseTotal = personalExpense.reduce((accumulator, expense) => accumulator + expense.amount, 0);
  return personalExpenseTotal;
}

interface Payment {
  id: number;
  amount: number;
  item: string;
}

export async function personalPaymentTotal(groupId: number, userId: number) {
  const personalPayments = await getPersonalPayments(groupId, userId);
  const total = personalPayments.reduce((accumulator: number, payment: Payment) => accumulator + payment.amount, 0);
  return total;
}

interface Settlement {
  id: number;
  payer_id: number;
  repay_at: number;
  amount: number;
}

export async function personalsettlementsTotal(groupId: number, userId: number) {
  const personalsettlements = await getPersonalsettlements(groupId, userId);
  const total = personalsettlements.reduce(
    (accumulator: number, settlement: Settlement) => accumulator + settlement.amount,
    0
  );
  return total;
}

export async function personalRepaymentTotal(groupId: number, userId: number) {
  const personalRepayments = await getPersonalRepayments(groupId, userId);
  const total = personalRepayments.reduce(
    (accumulator: number, settlement: Settlement) => accumulator + settlement.amount,
    0
  );
  return total;
}

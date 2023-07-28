import { getUserName } from '../models/users.js';
import { getPaymentIds } from '../models/payments.js';
import { debts } from './debts.js';
import { computeBalances, computeSettlement } from './balances.js';

function debtorGroup(balances: { [s: string]: number }) {
  //  const collector = Object.keys(balances)[0];
  return Object.entries(balances)
    .filter(([, balance]) => balance < 0)
    .sort(([, balance1], [, balance2]) => balance1 - balance2);
}

function creditorGroup(balances: { [s: string]: number }) {
  //  const collector = Object.keys(balances)[0];
  return Object.entries(balances)
    .filter(([, balance]) => balance > 0)
    .sort(([, balance1], [, balance2]) => balance1 - balance2);
}

function transactions(debtors: [string, number][], creditors: [string, number][]) {
  try {
    const answer = [];
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor: any = debtors.shift();
      const creditor: any = creditors.shift();
      const [debtorId, debtorValue] = debtor;
      const [creditorId, creditorValue] = creditor;
      const amountLeft = debtorValue + creditorValue;
      const transaction1 = {
        debtorId,
        creditorId,
        amount: Math.abs(creditorValue),
      };
      const transaction2 = {
        debtorId,
        creditorId,
        amount: Math.abs(debtorValue),
      };
      if (amountLeft < 0) {
        answer.push(transaction1);
        debtors.unshift([debtorId, amountLeft]);
      } else if (amountLeft > 0) {
        answer.push(transaction2);
        creditors.unshift([creditorId, amountLeft]);
      } else {
        answer.push(transaction2);
      }
    }
    return answer;
  } catch (error) {
    return error;
  }
}

interface Transaction {
  debtorId: number;
  creditorId: number;
  amount: number;
}

async function addNameToTransactions(groupTransactions: Transaction[]) {
  const formattedTransactions = await Promise.all(
    groupTransactions.map(async (transaction: Transaction) => {
      const { debtorId, creditorId, amount } = transaction;
      const [debtor, creditor] = await Promise.all([getUserName(debtorId), getUserName(creditorId)]);
      return {
        debtor: debtor[0].name,
        debtorId,
        creditor: creditor[0].name,
        creditorId,
        amount,
      };
    })
  );

  return formattedTransactions;
}

export default async function sortTransaction(groupId: number) {
  const payments = await getPaymentIds(groupId);
  const debtsRecords = await Promise.all(
    payments.map(async (payment: any) => {
      const debtRecord = await debts(payment.id);
      return debtRecord;
    })
  );
  const cleanDebtRecord = debtsRecords.flat();
  const balancesRecord = computeBalances(cleanDebtRecord);
  const settledBalances = await computeSettlement(balancesRecord, groupId);
  const creditors: [string, number][] = creditorGroup(settledBalances);
  const debtors: [string, number][] = debtorGroup(balancesRecord);
  const groupTransactions = await transactions(debtors, creditors);
  const finalTransactions = await addNameToTransactions(groupTransactions as Transaction[]);
  return finalTransactions;
}

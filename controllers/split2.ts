//import {getUserName} from '../models/getUserName.js';
import { getUserName } from '../models/users.js';
import { getPaymentIds } from '../models/payments.js';
import { debts } from './debts.js';
import computeBalances from './balances.js';


export async function sortTransaction(groupId: number) {
  const payments = await getPaymentIds(groupId);
  const debtsRecords = await Promise.all(payments.map(async (payment : any) => {
    const debtRecord = await debts(payment.id);
    return debtRecord;
  }));
    const cleanDebtRecord = debtsRecords.flat();
    const balancesRecord = computeBalances(cleanDebtRecord);
    const creditors : [string, number][]= creditorGroup(balancesRecord);
    const debtors : [string, number][]= debtorGroup(balancesRecord);
    const groupTransactions = await transactions(debtors, creditors);
    return groupTransactions;
    //res.render('group_data', {users: groupUsers, transcations: groupTransactions, payments: groupPayments});
}

function debtorGroup(balances: { [s: string]: number; } ) {
  let collector = Object.keys(balances)[0];
  return Object.entries(balances)
    .filter(([, balance]) => balance < 0)
    .sort(([, balance1], [, balance2]) => balance1 - balance2);
}

function creditorGroup(balances: { [s: string]: number; } ) {
  let collector = Object.keys(balances)[0];
  return Object.entries(balances)
    .filter(([, balance]) => balance > 0)
    .sort(([, balance1], [, balance2]) => balance1 - balance2);
}

async function transactions(debtors : [string, number][] , creditors: [string, number][] ){
  try {
    const answer = [];
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor : any = debtors.shift();
      const creditor : any = creditors.shift();
      const [debtorId, debtorValue] = debtor;
      const [creditorId, creditorValue] = creditor;
      const amountLeft = debtorValue + creditorValue;
      const [debtorName] = await getUserName(debtorId);
      const [creditorName] = await getUserName(creditorId);
      const transaction1 = {
        debtor: debtorName.name,
        creditor: creditorName.name,
        amount: Math.abs(creditorValue)
      }
      const transaction2 = {
        debtor: debtorName.name,
        creditor: creditorName.name,
        amount: Math.abs(debtorValue)
      }
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

    }
}




/*export {
  debtorGroup,
  creditorGroup,
  transactions
}*/


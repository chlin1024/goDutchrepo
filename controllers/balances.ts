import { getGroupSettlements } from '../models/settlements.js';

export function computeBalances(debts: { debtor: any; creditor: any; amount: number }[]) {
  const balances: { [key: string]: number } = {};
  debts.forEach((debt: { debtor: any; creditor: any; amount: number }) => {
    const { debtor, creditor, amount } = debt;
    if (!(debtor in balances)) {
      balances[debtor] = 0;
    }
    if (!(creditor in balances)) {
      balances[creditor] = 0;
    }
    balances[debtor] -= amount;
    balances[creditor] += amount;
  });
  return balances;
}

export async function computeSettlement(balances: { [key: string]: number }, groupId: number) {
  const balance = balances;
  const groupSettlements = await getGroupSettlements(groupId);
  groupSettlements.forEach((settlement: { id: number; payer_id: number; receiver_id: number; amount: number }) => {
    const payer = settlement.payer_id;
    const receiver = settlement.receiver_id;
    const { amount } = settlement;
    if (payer in balance) {
      balance[payer] += amount;
    }
    if (receiver in balance) {
      balance[receiver] -= amount;
    }
  });
  return balance;
}

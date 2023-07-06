import { getGroupSettlements } from '../models/settlements.js'

export function computeBalances(debts: { debtor: any; creditor: any; amount: number; }[]) {
  let balances: { [key: string]: number } = {};
  debts.forEach ((debt: { debtor: any; creditor: any; amount: number; }) => {
      const debtor = debt.debtor;
      const creditor = debt.creditor;
      const amount = debt.amount;
      
      if (!(debtor in balances)) {
          balances[debtor] = 0;
      }
      if (!(creditor in balances)) {
          balances[creditor] = 0;
      }
      balances[debtor] -= amount;
      balances[creditor] += amount;
  })
  console.log(balances);
  return balances;
}

export async function computeSettlement(balances: { [key: string]: number } , groupId: number) {
    const groupSettlements = await getGroupSettlements(groupId);
    groupSettlements.forEach((settlement: {id: number, payer_id: number, receiver_id: number, amount: number}) => {
        const payer = settlement.payer_id
        const receiver = settlement.receiver_id
        const amount = settlement.amount
        if (payer in balances ) {
            balances[payer] += amount;
        }
        if (receiver in balances ) {
            balances[receiver] -= amount;
        }
    })
    return balances;
}

//export default computeBalances;
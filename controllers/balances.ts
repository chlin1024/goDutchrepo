function computeBalances(debts: { debtor: any; creditor: any; amount: number; }[]) {
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
  return balances;
}
export default computeBalances;
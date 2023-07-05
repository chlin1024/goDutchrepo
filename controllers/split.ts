function simplifyWithCollector(balances: { [s: string]: number; } ) {
  let collector = Object.keys(balances)[0];
  return Object.entries(balances)
    .filter(([person]) => person !== collector)
    .filter(([, balance]) => balance !== 0)
    .map(([person, balance]) =>[collector, person, balance]);
}

function showTransactions(transactions: any) {
  for (let [debtor, creditor, value] of transactions) {
    if (value > 0) {
      console.log(`${debtor} owes ${creditor} $${value}`);
    } else {
      console.log(`${creditor} owes ${debtor} $${-value}`);
    }
  }
}

export {
  simplifyWithCollector,
  showTransactions
}

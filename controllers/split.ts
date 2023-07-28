function simplifyWithCollector(balances: { [s: string]: number }) {
  const collector = Object.keys(balances)[0];
  return Object.entries(balances)
    .filter(([person]) => person !== collector)
    .filter(([, balance]) => balance !== 0)
    .map(([person, balance]) => [collector, person, balance]);
}

function showTransactions(transactions: any) {
  transactions.forEach(([debtor, creditor, value]: number[]) => {
    if (value > 0) {
      console.log(`${debtor} owes ${creditor} $${value}`);
    } else {
      console.log(`${creditor} owes ${debtor} $${-value}`);
    }
  });
}

export { simplifyWithCollector, showTransactions };

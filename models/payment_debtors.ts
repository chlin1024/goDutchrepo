import promisePool from './databasePool.js'

export async function countDebtors(paymentId: number) {
  const [getDebtorCounts] : any = await promisePool.query(
    `SELECT COUNT(debtor_id) FROM payment_debtors 
     WHERE payment_id = ?`, 
     [paymentId]);
  return getDebtorCounts;
}

export async function createDebtors(paymentId: number, debtorId: number) {
  const [insertDebtors] : any = await promisePool.query(
    `INSERT INTO payment_debtors (payment_id, debtor_id)
     VALUES (?, ?)`, 
     [paymentId, debtorId]);
  const insertId = insertDebtors.insertId;
  return insertId;
}

export async function getDebtors(paymentId: number) {
  const [getDebtors] : any = await promisePool.query(
    `SELECT debtor_id FROM payment_debtors 
     WHERE payment_id = ?`, 
     [paymentId]);
  return getDebtors;
}

export async function deleteDebtorsByPaymentId(paymentId: number) {
  const [result] : any = await promisePool.query(
    `DELETE FROM payment_debtors 
     WHERE payment_id = ?`, 
     [paymentId]);
  return result;
}

export async function deleteDebtor(paymentId: number, debtorId: number) {
  const [result] : any = await promisePool.query(
    `DELETE FROM payment_debtors 
     WHERE payment_id = ? and debtor_id = ?`, 
     [paymentId, debtorId]);
  return result;
}

export async function updateDebtorsByPaymentId(paymentId: number, debtorId:number) {
  const [result] : any = await promisePool.query(
    `UPDATE payment_debtors
     SET  debtor_id = ?
     WHERE payment_id = ?`, 
     [debtorId, paymentId]);
  return result;
}
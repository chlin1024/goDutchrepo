import promisePool from './databasePool.js'

export async function createPayment(item : string, amount : number, creditorId : number, groupId : number, Numberofdebtor : number) {
  const [insertPayment] : any = await promisePool.query(
    `INSERT INTO payments (item, amount, creditor_id, group_id, debtors_no)
     VALUES (?, ?, ?, ?, ?)`, 
     [item, amount, creditorId, groupId, Numberofdebtor]);
  const insertId = insertPayment.insertId;
  return insertId;
}

export async function getGroupPayments(groupId: number) {
  const [groupPayments] : any = await promisePool.query(
    `SELECT id, creditor_id, amount, item FROM payments 
     WHERE group_id = ?`, 
     [groupId]);
  return groupPayments;
}

export async function getPaymentDetails(paymentId: number) {
  const [PaymentDetails] : any = await promisePool.query(
    `SELECT creditor_id, amount, item FROM payments 
     WHERE id = ?`, 
     [paymentId]);
  return PaymentDetails;
}

export async function getPaymentIds(groupId: number) {
  const [getPaymentIds] : any = await promisePool.query(
    `SELECT id FROM payments 
     WHERE group_id = ?`, 
     [groupId]);
  return getPaymentIds;
}

export async function updatePaymentById(item : string, amount : number, creditorId : number, numberOfDebtors : number, paymentId: number) {
  const [result] : any = await promisePool.query(
    `UPDATE payments
     SET item = ?, amount = ?, creditor_id = ?, debtors_no = ?
     WHERE id = ?`, 
     [item, amount, creditorId, numberOfDebtors, paymentId]);
  return result;
}

export async function deletePaymentById(paymentId: number) {
  const [result] : any = await promisePool.query(
    `DELETE FROM payments 
     WHERE id = ?`, 
     [paymentId]);
  return result;
}

export async function updatePayment(debtorId:number, paymentId: number) {
  const [result] : any = await promisePool.query(
    `UPDATE payments
     SET (item, amount, creditor_id, debtors_no) = ?
     WHERE id = ?`, 
     [debtorId, paymentId]);
  return result;
}
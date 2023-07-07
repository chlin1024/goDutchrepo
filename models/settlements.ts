import promisePool from './databasePool.js'

export async function createSettlement(amount : number, payerId : number, groupId : number, receiverId : number) {
  const time = Date.now()
  const [insertSettlement] : any = await promisePool.query(
    `INSERT INTO settlements (payer_id, group_id, receiver_id, repay_at, amount)
     VALUES (?, ?, ?, ?, ?)`, 
     [payerId, groupId, receiverId, time, amount]);
  const insertId = insertSettlement.insertId;
  return insertId;
}

export async function getGroupSettlements(groupId: number) {
  const [groupSettlements] : any = await promisePool.query(
    `SELECT id, payer_id, receiver_id, amount FROM settlements 
     WHERE group_id = ?`, 
     [groupId]);
  return groupSettlements;
}
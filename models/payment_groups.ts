import promisePool from './databasePool.js'

export async function createGroup(groupName: string, creatorId: number) {
  const time = Date.now();
  const [insertGroup] : any = await promisePool.query(
    `INSERT INTO payment_groups (group_name, group_creator_id, created_at)
     VALUES (?, ?, ?)`,
     [groupName, creatorId, time]);
  const groupId : number = insertGroup.insertId;
  return groupId;
}

export async function getGroupName(groupId: number) {
  const [result] : any = await promisePool.query(
    `SELECT group_name FROM payment_groups WHERE id = ?`,
    [groupId]);
  const groupName = result[0].group_name;
  return groupName;
}

export async function editGroupName(groupName: string, groupId: number) {
  const [result] = await promisePool.query(
    `UPDATE payment_groups SET group_name = ? WHERE Id = ?;`,
    [groupName, groupId]);
  console.log(result);
  return result;
}
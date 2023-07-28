import promisePool from './databasePool.js';

export async function createGroup(groupName: string, creatorId: number) {
  const time = Date.now();
  const groupToken = Math.random().toString(16).substring(2, 8);
  const [insertGroup]: any = await promisePool.query(
    `INSERT INTO payment_groups (group_name, group_creator_id, created_at, group_token)
     VALUES (?, ?, ?, ?)`,
    [groupName, creatorId, time, groupToken]
  );
  const groupId: number = insertGroup.insertId;
  return groupId;
}

export async function getGroupName(groupId: number) {
  const [result]: any = await promisePool.query('SELECT group_name FROM payment_groups WHERE id = ?', [groupId]);
  const groupName = result[0].group_name;
  return groupName;
}

export async function editGroupName(groupName: string, groupId: number) {
  const [result] = await promisePool.query('UPDATE payment_groups SET group_name = ? WHERE Id = ?;', [
    groupName,
    groupId,
  ]);
  return result;
}

export async function getGroupIdByToken(groupToken: string) {
  const [result]: any = await promisePool.query('SELECT id FROM payment_groups WHERE group_token = ?', [groupToken]);
  const groupId = result[0].id;
  return groupId;
}

export async function getGroupToken(groupId: number) {
  const [result]: any = await promisePool.query('SELECT group_token FROM payment_groups WHERE id = ?', [groupId]);
  const groupToken = result[0].group_token;
  return groupToken;
}

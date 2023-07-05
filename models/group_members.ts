import promisePool from './databasePool.js'

export async function getGroupMember(groupId:number) {
  const [groupMember] : any = await promisePool.query(
    `SELECT group_members.group_member_id, users.name FROM group_members 
     JOIN users ON group_members.group_member_id=users.id WHERE group_id = ?`,
     [groupId]);
  return groupMember;
}

export async function createGroupMember(groupId: number, userId: number) {
  const [result] = await promisePool.query(
    `INSERT INTO group_members (group_id, group_member_id)
     VALUE (?, ?); `,
     [groupId, userId]);
  return result;
}

export async function getGroupsByMemberId(userId:number) {
  const [groups] : any = await promisePool.query(
    `SELECT group_id FROM group_members WHERE group_member_id = ?`,
     [userId]);
  return groups;
}

export async function getGroupUsers(groupId: number) {
  const [results] = await promisePool.query(
    `SELECT group_member_id FROM group_members WHERE group_id = ?;`,
    [groupId]
  )
  return results;
}

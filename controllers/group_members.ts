import { getGroupMember } from '../models/group_members.js'
import { getUserName } from '../models/users.js'

export async function groupMember(groupId: number) {
  const groupMember = await getGroupMember(groupId);
  const groupMemberArray : any[] = []
  //const groupMemberNameArray : any[] = []
  groupMember.map((member : any) => groupMemberArray.push(member.group_member_id));
  //groupMember.map(async (member : any) => groupMemberNameArray.push(await getUserName(member.group_member_id)));
  return groupMemberArray;
}

/*export async function getUserName(userId: number) {
  const [userName] : any = await promisePool.query(
    `SELECT name FROM users
     WHERE id = ?`, 
     [userId]);
  return userName;
}*/

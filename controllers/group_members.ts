import { getGroupMember } from '../models/group_members.js';

export default async function groupMember(groupId: number) {
  const groupMemberData = await getGroupMember(groupId);
  const groupMemberArray : any[] = [];
  groupMemberData.map((member : any) => groupMemberArray.push(member.group_member_id));
  return groupMemberArray;
}

import { createGroup } from '../models/payment_groups.js'
import { createGroupMember, getGroupsByMemberId } from '../models/group_members.js'
import { getGroupName } from '../models/payment_groups.js'

export async function createGroupControl(groupName: string, userId: number){
  const groupId: number = await createGroup(groupName, userId);
  const result = await createGroupMember(groupId, userId);
  return groupId;
}

export async function getGroupData(userId: number){
  const groups = [];
  const groupIds = await getGroupsByMemberId(userId);
  for (const groupId of groupIds) {
    const id = groupId.group_id;
    const name = await getGroupName(id);
    const group = {
      groupId: id,
      groupName: name
    }
    groups.push(group);
  }
  return groups
}


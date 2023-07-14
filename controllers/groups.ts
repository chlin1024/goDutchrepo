import { createGroupMember, getGroupsByMemberId } from '../models/group_members.js';
import { createGroup, getGroupName } from '../models/payment_groups.js';

export async function createGroupControl(groupName: string, userId: number) {
  const groupId: number = await createGroup(groupName, userId);
  await createGroupMember(groupId, userId);
  return groupId;
}

export async function getGroupData(userId: number) {
  const groupIds = await getGroupsByMemberId(userId);
  const groups = await Promise.all(groupIds.map(async (groupId: { group_id: number }) => {
    const id = groupId.group_id;
    const name = await getGroupName(id);
    return {
      groupId: id,
      groupName: name,
    };
  }));
  return groups;
}

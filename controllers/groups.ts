import { Request, Response } from 'express';
import { createGroupMember, getGroupsByMemberId, getGroupMember } from '../models/group_members.js';
import { createGroup, getGroupName, getGroupIdByToken, getGroupToken } from '../models/payment_groups.js';
import { getUserName } from '../models/users.js';
import { printPayments } from './payments.js';
import sortTransaction from './split2.js';
import groupMember from './group_members.js';
import {
  calpersonalExpenseTotal,
  personalPaymentTotal,
  personalsettlementsTotal,
  personalRepaymentTotal,
} from './personal_expense.js';
import verifyUserJWT from '../utils/verifyJWT.js';

async function createGroupControl(groupName: string, userId: number) {
  const groupId: number = await createGroup(groupName, userId);
  await createGroupMember(groupId, userId);
  return groupId;
}

export async function getGroupData(userId: number) {
  const groupIds = await getGroupsByMemberId(userId);
  const groups = await Promise.all(
    groupIds.map(async (groupId: { group_id: number }) => {
      const id = groupId.group_id;
      const name = await getGroupName(id);
      return {
        groupId: id,
        groupName: name,
      };
    })
  );
  return groups;
}

export async function createGroupView(req: Request, res: Response) {
  res.render('create_group_new');
}

export async function createGroupRoute(req: Request, res: Response) {
  try {
    const { groupName } = req.body;
    const userToken = req.cookies.jwtUserToken;
    if (!userToken) {
      res.redirect('/user/signin');
    }
    const payload = verifyUserJWT(userToken);
    const { userId } = payload;
    if (!payload) {
      res.redirect('/user/signin');
      return;
    }
    const groupId = await createGroupControl(groupName, userId);
    res.status(200).json({ statusCode: 200, groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ statusCode: 500, message: error });
  }
}

export async function groupInviteLink(req: Request, res: Response) {
  try {
    const groupToken = req.params?.groupToken;
    const userToken = req.cookies.jwtUserToken;
    if (!userToken) {
      res.cookie('referer', `/group/invitation/${groupToken}`);
      res.redirect('/user/signin');
      return;
    }
    const payload = verifyUserJWT(userToken);
    const { userId } = payload;
    if (!payload) {
      res.redirect('/user/signin');
      return;
    }
    const groupId = await getGroupIdByToken(groupToken);
    if (groupId) {
      const groupMemberArray = await groupMember(groupId);
      const isgroupMember = groupMemberArray.includes(userId);
      if (!isgroupMember) {
        await createGroupMember(groupId, userId);
      }
      res.cookie('referer', '', { maxAge: 1 });
      res.redirect(`/group/${groupId}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500);
  }
}

export async function groupPage(req: Request, res: Response) {
  try {
    const groupId: number = parseInt(req.params?.groupId, 10);
    const userJWT = req.cookies.jwtUserToken;
    const groupToken = await getGroupToken(groupId);
    const payload = verifyUserJWT(userJWT);
    const { userId } = payload;
    if (!payload) {
      res.redirect('/user/signin');
      return;
    }
    if (!groupId) {
      res.status(400).send('Please provide group Id');
      return;
    }
    res.cookie('groupId', groupId);
    const groupName = await getGroupName(groupId);
    const groupUsers = await getGroupMember(groupId);
    const groupMemberArray = await groupMember(groupId);
    const isgroupMember = groupMemberArray.includes(userId);
    if (isgroupMember) {
      const groupPayments = await printPayments(groupId);
      const groupTransactions = await sortTransaction(groupId);
      const personalExpenseTotal = await calpersonalExpenseTotal(groupId, userId);
      const personalpayments = await personalPaymentTotal(groupId, userId);
      const personalsettlements = await personalsettlementsTotal(groupId, userId);
      const personalsrepayments = await personalRepaymentTotal(groupId, userId);
      const userNameResult = await getUserName(userId);
      const userName = userNameResult[0].name;
      res.render('group_page', {
        groupId,
        groupName,
        users: groupUsers,
        userName,
        transactions: groupTransactions,
        payments: groupPayments,
        personalExpenseTotal,
        personalpayments,
        personalsettlements,
        personalsrepayments,
        invite: `/group/invitation/${groupToken}`,
      });
    } else {
      res.send('you are not group member');
    }
  } catch (error) {
    res.status(500);
  }
}

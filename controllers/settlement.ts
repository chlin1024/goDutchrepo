import { Request, Response } from 'express';
import { getGroupMember } from '../models/group_members.js';
import { createSettlement } from '../models/settlements.js';

export async function createSettlementView(req: Request, res: Response) {
  try {
    const { group, debtor, creditor, amount } = req.query;
    const groupId = parseInt(group as string, 10);
    const transactionData = { groupId, debtor, creditor, amount };
    // const { groupId } = req.cookies;
    const groupUsers = await getGroupMember(groupId);
    res.render('create_settlement', { users: groupUsers, transactionData });
  } catch (error) {
    res.status(500);
  }
}

export async function createSettlementctl(req: Request, res: Response) {
  try {
    const { groupId, payer, amount, receiver } = req.body;
    //  const { groupId } = req.cookies;
    await createSettlement(amount, payer, groupId, receiver);
    return res.status(200).json({ statusCode: 200, groupId });
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
}

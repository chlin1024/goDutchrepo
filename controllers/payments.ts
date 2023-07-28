import { Request, Response } from 'express';
import updateDebtor from './update_debtors.js';
import { getUserName } from '../models/users.js';
import { getDebtors, createDebtors, deleteDebtorsByPaymentId } from '../models/payment_debtors.js';
import { getGroupMember } from '../models/group_members.js';
import {
  createPayment,
  getGroupPayments,
  deletePaymentById,
  getPaymentDetails,
  updatePaymentById,
} from '../models/payments.js';

interface Payment {
  id: number;
  creditor_id: number;
  amount: number;
  item: string;
}

export async function printPayments(groupId: number) {
  const groupPayments = await getGroupPayments(groupId);
  const results = await Promise.all(
    groupPayments.map(async (payment: Payment) => {
      const paymentId = payment.id;
      const creditorId = payment.creditor_id;
      const [creditor] = await getUserName(creditorId);
      const creditorName = creditor.name;
      return {
        paymentId,
        creditorName,
        amount: payment.amount,
        item: payment.item,
      };
    })
  );
  return results;
}

async function deletePayment(paymentId: number) {
  await deleteDebtorsByPaymentId(paymentId);
  await deletePaymentById(paymentId);
}

async function createPaymentcontrol(
  item: string,
  amount: number,
  creditor: number,
  groupId: number,
  numberOfDebtors: number,
  debtors: []
) {
  const insertPaymentId = await createPayment(item, amount, creditor, groupId, numberOfDebtors);
  await debtors.map((debtor: any) => createDebtors(insertPaymentId, debtor));
}

export async function createPaymentView(req: Request, res: Response) {
  try {
    const { groupId } = req.cookies;
    const groupUsers = await getGroupMember(groupId);
    res.render('create_payment', { users: groupUsers });
  } catch (error) {
    res.status(500);
  }
}

export async function paymentInfoView(req: Request, res: Response) {
  try {
    const paymentId: number = parseInt(req.params?.paymentId, 10);
    const { groupId } = req.cookies;
    const paymentData = await getPaymentDetails(paymentId);
    if (paymentData.length === 1) {
      const debtors = await getDebtors(paymentId);
      const groupUsers = await getGroupMember(groupId);
      res.cookie('paymentId', paymentId);
      res.render('edit_payment', { users: groupUsers, payment: paymentData, debtors });
    } else {
      res.redirect(`/group/${groupId}`);
    }
  } catch (error) {
    console.error(error);
  }
}

export async function createPaymentRoute(req: Request, res: Response) {
  try {
    const { item, creditor, amount, debtors } = req.body;
    const numberOfDebtors = debtors.length;
    const { groupId } = req.cookies;
    await createPaymentcontrol(item, amount, creditor, groupId, numberOfDebtors, debtors);
    res.status(200).json({ statusCode: 200, groupId });
  } catch (error) {
    res.status(500).json({ statusCode: 500 });
  }
}

export async function paymentUpdate(req: Request, res: Response) {
  try {
    const { item, creditor, amount, debtors } = req.body;
    const paymentId = parseInt(req.cookies.paymentId, 10);
    const numberOfDebtors = debtors.length;
    const { groupId } = req.cookies;
    const creditorId = creditor;
    await updatePaymentById(item, amount, creditorId, numberOfDebtors, paymentId);
    await updateDebtor(debtors, paymentId);
    return res.status(200).json({ statusCode: 200, groupId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ statusCode: 500 });
  }
}

export async function paymentDelete(req: Request, res: Response) {
  try {
    const { paymentId, groupId } = req.cookies;
    await deletePayment(paymentId);
    res.status(200).json({ statusCode: 200, groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ statusCode: 500 });
  }
}

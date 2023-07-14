import { getDebtors, createDebtors, deleteDebtor } from '../models/payment_debtors.js';

function getDifference(arr1: number[], arr2: number[]) {
  return arr1.filter((element) => !arr2.includes(element));
}

export default async function updateDebtor(updateDebtorsString: string[], paymentId: number) {
  try {
    const originDebtorsResult = await getDebtors(paymentId);
    const originDebtors: number[] = [];
    originDebtorsResult.forEach((debtor: any) => {
      originDebtors.push(debtor.debtor_id);
    });
    const updateDebtors = updateDebtorsString.map((str) => parseInt(str, 10));
    const newDebtors = getDifference(updateDebtors, originDebtors);
    newDebtors.map((debtor : any) => createDebtors(paymentId, debtor));
    const deleteDebtors = getDifference(originDebtors, updateDebtors);
    deleteDebtors.map((debtor : any) => deleteDebtor(paymentId, debtor));
    return true;
  } catch (error) {
    return error;
  }
}

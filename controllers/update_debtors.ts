import { getDebtors, createDebtors, deleteDebtor } from '../models/payment_debtors.js'

export async function updateDebtor(updateDebtorsString: string[], paymentId: number){
  try{
    const originDebtorsResult = await getDebtors(paymentId);
    let originDebtors: number[] = [];
    originDebtorsResult.map((debtor: any) => {
      originDebtors.push(debtor.debtor_id);
    })
    const updateDebtors = updateDebtorsString.map(function(str) {
      return parseInt(str); 
    });
    const newDebtors = getDifference(updateDebtors, originDebtors)
    // createDebtors
    newDebtors.map((debtor : any) => createDebtors(paymentId, debtor));
    const deleteDebtors = getDifference(originDebtors, updateDebtors)
    // deleteDebtor 
    deleteDebtors.map((debtor : any) => deleteDebtor(paymentId, debtor));
  } catch (error){
    console.error(error);
    return error;
  }
} 

function getDifference(arr1: number[], arr2: number[]) {
  return arr1.filter(element => {
    return !arr2.includes(element);
  });
}
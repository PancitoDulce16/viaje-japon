/** @typedef {'equal'|'custom'|'percentage'|'shares'} SplitMethod */
/** @typedef {{userId:string,email:string,amountMinor:number,baseAmountMinor:number,roundingAdjustmentMinor:number}} ExpenseAllocation */
/** @typedef {{enabled:true,paidBy:string,method:SplitMethod,participantIds:string[],allocations:ExpenseAllocation[],notes:string,status:'open'|'settled'}} ExpenseSplit */
/** @typedef {{payerId:string,receiverId:string,amountMinor:number,baseAmountMinor:number,currency:string,status:'pending'|'confirmed'|'voided',date:string,method?:string,reference?:string,notes?:string,createdBy:string}} Settlement */
export {};

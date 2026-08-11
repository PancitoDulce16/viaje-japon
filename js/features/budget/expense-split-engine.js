export const SPLIT_METHODS=Object.freeze(['equal','custom','percentage','shares']);

const assertIds=participants=>{const ids=participants.map(p=>p.userId);if(!ids.length||new Set(ids).size!==ids.length)throw new Error('Selecciona participantes únicos.');return ids;};
function weighted(total,rows,weightKey){
  const weights=rows.map(row=>BigInt(row[weightKey]));if(weights.some(value=>value<=0n))throw new Error('Todos los valores deben ser mayores que cero.');
  const sum=weights.reduce((a,b)=>a+b,0n),target=BigInt(total);let used=0n;
  const result=rows.map((row,index)=>{const product=target*weights[index],floor=product/sum;used+=floor;return{...row,amountMinor:Number(floor),roundingAdjustmentMinor:0,remainder:product%sum,index};});
  let missing=Number(target-used);result.sort((a,b)=>a.remainder===b.remainder?a.userId.localeCompare(b.userId):(a.remainder>b.remainder?-1:1));for(let i=0;i<missing;i++){result[i].amountMinor++;result[i].roundingAdjustmentMinor=1;}return result.sort((a,b)=>a.index-b.index).map(({remainder,index,...row})=>row);
}
export function calculateSplit({totalMinor,currency,baseTotalMinor,method,participants}){
  if(!Number.isSafeInteger(totalMinor)||totalMinor<=0)throw new Error('El total debe ser un entero positivo.');if(!SPLIT_METHODS.includes(method))throw new Error('Método de división inválido.');assertIds(participants);
  let rows;
  if(method==='custom'){if(participants.some(p=>!Number.isSafeInteger(p.valueMinor)||p.valueMinor<0)||participants.reduce((s,p)=>s+p.valueMinor,0)!==totalMinor)throw new Error('Los montos personalizados deben sumar exactamente el total.');rows=participants.map(p=>({...p,amountMinor:p.valueMinor}));}
  else if(method==='percentage'){if(participants.some(p=>!Number.isSafeInteger(p.basisPoints)||p.basisPoints<=0)||participants.reduce((s,p)=>s+p.basisPoints,0)!==10000)throw new Error('Los porcentajes deben sumar 100%.');rows=weighted(totalMinor,participants,'basisPoints');}
  else if(method==='shares')rows=weighted(totalMinor,participants,'shares');
  else rows=weighted(totalMinor,participants.map(p=>({...p,share:1})),'share');
  const base=Number.isSafeInteger(baseTotalMinor)?weighted(baseTotalMinor,rows.map(row=>({...row,weight:row.amountMinor})),'weight'):rows.map(row=>({...row,baseAmountMinor:null}));
  return rows.map((row,index)=>({...row,baseAmountMinor:base[index]?.amountMinor??null,currency}));
}

export function calculateBalances(expenses=[],settlements=[]){
  const balances=new Map(),detail=[];const add=(id,value)=>balances.set(id,(balances.get(id)||0)+value);
  for(const expense of expenses){if(!expense.split?.enabled)continue;const total=expense.convertedAmountMinor??expense.amountMinor;add(expense.split.paidBy,total);for(const share of expense.split.allocations||[]){const owed=share.baseAmountMinor??share.amountMinor;add(share.userId,-owed);detail.push({expenseId:expense.id,userId:share.userId,paidBy:expense.split.paidBy,amountMinor:owed});}}
  const applied=new Set();for(const payment of settlements){const key=payment.id||payment.settlementId;if(payment.status!=='confirmed'||(key&&applied.has(key)))continue;if(key)applied.add(key);add(payment.payerId,payment.baseAmountMinor);add(payment.receiverId,-payment.baseAmountMinor);}
  return {balances:Object.fromEntries([...balances].sort()),detail,total:[...balances.values()].reduce((a,b)=>a+b,0)};
}

export function simplifyBalances(balanceMap){
  const debtors=[],creditors=[];for(const [userId,value] of Object.entries(balanceMap)){if(value<0)debtors.push({userId,amount:-value});if(value>0)creditors.push({userId,amount:value});}debtors.sort((a,b)=>a.userId.localeCompare(b.userId));creditors.sort((a,b)=>a.userId.localeCompare(b.userId));const transfers=[];let d=0,c=0;while(d<debtors.length&&c<creditors.length){const amount=Math.min(debtors[d].amount,creditors[c].amount);if(amount)transfers.push({payerId:debtors[d].userId,receiverId:creditors[c].userId,amountMinor:amount,proposal:true});debtors[d].amount-=amount;creditors[c].amount-=amount;if(!debtors[d].amount)d++;if(!creditors[c].amount)c++;}return transfers;
}

export function settlementEffect(settlement){return settlement.status==='confirmed'?{[settlement.payerId]:settlement.baseAmountMinor,[settlement.receiverId]:-settlement.baseAmountMinor}:{};}

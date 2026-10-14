export function expiredStoredLock(before,after,unit,at) {
  if(unit?.lock===null)return true;
  const name={battle:'combates',market:'mercado',trade:'intercambios'}[unit?.lock?.type];if(!name)return false;
  const old=before[name].records.find(row=>row.id===unit.lock.referenceId),next=after[name].records.find(row=>row.id===unit.lock.referenceId);
  return old?.status===(name==='intercambios'?'locked':'active') && next?.status==='expired' && Date.parse(old.expiresAt)<=Date.parse(at) && (name==='combates'?next.finishedAt:next.closedAt)===at;
}

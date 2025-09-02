// /public/js/scoreboard/rules.js
export const parseFormat = (fmt) => {
  const f=(fmt||'best_of_3').toLowerCase();
  const isGP=f.endsWith('_gp');
  const isProset=f.startsWith?.('proset') || f.indexOf('proset')===0;
  const isSuper=f.startsWith?.('super_tiebreak') || f.indexOf('super_tiebreak')===0;
  const gamesToWinSet=isProset?9:6;
  const setsToWinMatch=isProset?1:2;
  return {f,isGP,isProset,isSuper,gamesToWinSet,setsToWinMatch};
};
export const isSetConcluded = (s,cfg,i) => {
  if(!s) return false;
  const t1=Number.isFinite(s.team1)?s.team1:0, t2=Number.isFinite(s.team2)?s.team2:0;
  const maxV=Math.max(t1,t2), minV=Math.min(t1,t2), diff=Math.abs(t1-t2);
  if(cfg.isSuper && i===2) return (maxV>=10)&&(diff>=2);
  if(cfg.isProset) return (maxV>=9)&&(diff>=2);
  if(maxV===7&&(minV===5||minV===6)) return true;
  return (maxV>=cfg.gamesToWinSet)&&(diff>=2);
};
export const countWonSets = (sets,cfg) => {
  let w1=0,w2=0;
  for(let i=0;i<Math.min(sets.length,3);i++){
    if(isSetConcluded(sets[i],cfg,i)){
      const {team1=0,team2=0}=sets[i]||{};
      if(team1>team2)w1++; else if(team2>team1)w2++;
    }
  }
  return [w1,w2];
};
export const tennisPoint = (n,gp) => {
  const map=[0,15,30,40,'AD']; if(!Number.isFinite(n)||n<0) return '—';
  return gp?map[Math.min(n,3)]:map[Math.min(n,4)];
};
export const isNormalTBActive = (cur,cfg) => {
  if(cfg.isProset) return false; const g1=Number(cur?.games_team1||0), g2=Number(cur?.games_team2||0);
  return g1===cfg.gamesToWinSet && g2===cfg.gamesToWinSet;
};
export const superTBActive = (sets,cfg,over) => {
  if(!cfg.isSuper) return false; const [w1,w2]=countWonSets(sets,cfg); if(over) return false;
  return (w1===1 && w2===1);
};

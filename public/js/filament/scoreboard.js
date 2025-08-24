// public/js/scoreboard.js (v3) — lê seleções da DB
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(async () => {
  const grid = document.getElementById('grid');
  const statusEl = document.getElementById('status');
  const SUPABASE_URL  = grid?.dataset?.sbUrl || '';
  const SUPABASE_ANON = grid?.dataset?.sbAnon || '';
  const SCREEN_KEY    = grid?.dataset?.screen || 'default';

  document.getElementById('fs')?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  function fmtTime(d){ return d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
  function escapeHtml(s=''){return s.replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function touch(text, ok){ if (statusEl) statusEl.innerHTML = `<span class="${ok?'status-ok':'status-bad'}">●</span> ${text} • ${fmtTime(new Date())}`; }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { realtime: { params: { eventsPerSecond: 5 }}});

  // ======== Regras padel (como já tínhamos) ========
  function parseFormat(fmt){ const f=(fmt||'best_of_3').toLowerCase(); const isGP=f.endsWith('_gp'); const isProset=f.startsWith('proset'); const isSuper=f.startsWith('super_tiebreak'); const gamesToWinSet=isProset?9:6; const setsToWinMatch=isProset?1:2; return {f,isGP,isProset,isSuper,gamesToWinSet,setsToWinMatch}; }
  function isSetConcluded(s,cfg,i){ if(!s)return false; const t1=Number.isFinite(s.team1)?s.team1:0, t2=Number.isFinite(s.team2)?s.team2:0; const maxV=Math.max(t1,t2), minV=Math.min(t1,t2), diff=Math.abs(t1-t2); if(cfg.isSuper && i===2) return (maxV>=10)&&(diff>=2); if(cfg.isProset) return (maxV>=9)&&(diff>=2); if(maxV===7&&(minV===5||minV===6)) return true; return (maxV>=cfg.gamesToWinSet)&&(diff>=2); }
  function countWonSets(sets,cfg){ let w1=0,w2=0; for(let i=0;i<Math.min(sets.length,3);i++){ if(isSetConcluded(sets[i],cfg,i)){ const {team1=0,team2=0}=sets[i]||{}; if(team1>team2)w1++; else if(team2>team1)w2++; } } return [w1,w2]; }
  function tennisPoint(n,gp){ const map=[0,15,30,40,'AD']; if(!Number.isFinite(n)||n<0) return '—'; return gp?map[Math.min(n,3)]:map[Math.min(n,4)]; }
  function isNormalTBActive(cur,cfg){ if(cfg.isProset) return false; const g1=Number(cur?.games_team1||0), g2=Number(cur?.games_team2||0); return g1===cfg.gamesToWinSet && g2===cfg.gamesToWinSet; }
  function superTBActive(sets,cfg,over){ if(!cfg.isSuper) return false; const [w1,w2]=countWonSets(sets,cfg); if(over) return false; return (w1===1 && w2===1); }

  // ======== Layout ========
  function computeGrid(n, layout='auto'){
    if (layout && layout !== 'auto'){
      const [c,r] = layout.split('x').map(Number);
      if (Number.isFinite(c) && Number.isFinite(r)) return [c,r];
    }
    const portrait = window.innerHeight >= window.innerWidth;
    if (portrait){
      if (n===1) return [1,1];
      if (n===2) return [1,2];
      if (n===3) return [1,3];
      return [1,4];
    } else {
      if (n===1) return [1,1];
      if (n===2) return [2,1];
      return [2,2];
    }
  }

  function renderGrid(games, layout='auto'){
    grid.innerHTML = '';
    const n = games.length;
    const [cols, rows] = computeGrid(n || 1, layout);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

    if (!n){
      const ph = document.createElement('div'); ph.className='tile placeholder';
      ph.innerHTML='Sem jogos para mostrar. Configura no backoffice.';
      grid.appendChild(ph);
      return;
    }
    games.forEach(g => grid.appendChild(tile(g)));
    const target = cols*rows;
    for (let i=n; i<target; i++){
      const ph=document.createElement('div'); ph.className='tile placeholder'; grid.appendChild(ph);
    }
  }

  function tile(game){
    const cfg = parseFormat(game.format);
    const s = game.score || {};
    const sets = Array.isArray(s.sets) ? s.sets.slice(0,3) : [];
    const cur = s.current || {};
    const [w1,w2] = countWonSets(sets, cfg);
    const over = (w1>=cfg.setsToWinMatch) || (w2>=cfg.setsToWinMatch);
    const normalTB = isNormalTBActive(cur, cfg);
    const superTB = superTBActive(sets, cfg, over);

    const pair1 = `${escapeHtml(game.player1)} & ${escapeHtml(game.player2)}`;
    const pair2 = `${escapeHtml(game.player3)} & ${escapeHtml(game.player4)}`;
    const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
    const tb1 = Number(cur.tb_team1||0), tb2 = Number(cur.tb_team2||0);
    const p1 = Number(cur.points_team1||0), p2 = Number(cur.points_team2||0);
    let mainLine='', subLine='';
    if (superTB){ mainLine=`Super TB ${tb1}–${tb2}`; subLine=`Jogos ${g1}–${g2}`; }
    else if (normalTB){ mainLine=`TB ${tb1}–${tb2}`; subLine=`Jogos ${g1}–${g2}`; }
    else { mainLine=`${tennisPoint(p1,cfg.isGP)}–${tennisPoint(p2,cfg.isGP)}`; subLine=`Jogos ${g1}–${g2}`; }

    const maxSets = cfg.setsToWinMatch*2-1;
    const boxes=[];
    for (let i=0;i<Math.min(sets.length,maxSets);i++){
      const set=sets[i]||{}; const concluded=isSetConcluded(set,cfg,i);
      let showCurrent=false,label='',top=0,bot=0;
      if (concluded){ top=Number(set.team1||0); bot=Number(set.team2||0); }
      else {
        const currentIndex = (()=>{ let c=0; for(let k=0;k<Math.min(sets.length,maxSets);k++){ if(isSetConcluded(sets[k],cfg,k)) c++; } return c; })();
        if (i===currentIndex){
          if (superTB){ const anyTB=(tb1+tb2)>0; if (anyTB){ top=tb1; bot=tb2; label='Super TB'; showCurrent=true; } }
          else if (normalTB){ const anyTB=(tb1+tb2)>0; if (anyTB){ top=tb1; bot=tb2; label='TB'; showCurrent=true; } }
          else { const anyGames=(g1+g2)>0; if (anyGames){ top=g1; bot=g2; showCurrent=true; } }
        }
      }
      if (concluded || showCurrent){
        boxes.push(`<div class="set ${showCurrent?'current':''}"><strong>${top}</strong><small>${bot}</small>${label?'<small>'+label+'</small>':''}</div>`);
      }
    }

    const wrap=document.createElement('div'); wrap.className='tile';
    const courtName = game.court_name ? `Campo ${escapeHtml(game.court_name)}` :
                      (game.court_id ? `Campo ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');

    wrap.innerHTML = `
      <div class="row">
        <div>
          <span class="badge">${escapeHtml(game.format || 'best_of_3')}</span>
          ${courtName ? `<span class="muted" style="margin-left:8px">• ${courtName}</span>` : ''}
        </div>
        <div>${over ? 'Final' :
          ((superTB || normalTB || (g1+g2+p1+p2+tb1+tb2)>0) ? '<span class="pulse">AO VIVO</span>' : 'Pré-jogo')}</div>
      </div>
      <div class="teams" style="margin-top:8px">
        <div class="pair right"><div class="names">${pair1}</div></div>
        <div class="scoreBox">
          <div class="games">${mainLine}</div>
          <div class="points">${subLine}</div>
          <div class="sets">${boxes.join('')}</div>
        </div>
        <div class="pair"><div class="names">${pair2}</div></div>
      </div>`;
    return wrap;
  }

  // ========== DATA: screen -> selections -> games (+courts) ==========
  async function getScreenByKey(key){
    const { data, error } = await supabase.from('scoreboards').select('id, layout, kiosk, title').eq('key', key).single();
    if (error) throw error;
    return data;
  }

  async function getSelections(screenId){
    const { data, error } = await supabase
      .from('scoreboard_selections')
      .select('position, game_id')
      .eq('scoreboard_id', screenId)
      .order('position', { ascending: true });
    if (error) throw error;
    return (data || []).map(r => r.game_id).filter(Boolean).slice(0,4);
  }

  async function getGames(ids){
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from('games')
      .select('id,player1,player2,player3,player4,format,score,court_id,created_at')
      .in('id', ids);
    if (error) throw error;
    const games = (data || []).sort((a,b)=> ids.indexOf(a.id)-ids.indexOf(b.id));
    const courtIds = [...new Set(games.map(g=>g.court_id).filter(Boolean))];
    if (courtIds.length){
      const { data: courts } = await supabase.from('courts').select('id,name').in('id', courtIds);
      const map = new Map((courts||[]).map(c=>[c.id,c.name]));
      for (const g of games){ if (g.court_id && map.has(g.court_id)) g.court_name = map.get(g.court_id); }
    }
    return games;
  }

  // ===== Bootstrap
  let currentGames = [];
  let screen = null;
  try {
    screen = await getScreenByKey(SCREEN_KEY);
    if (screen?.kiosk) document.body.classList.add('hide-cursor');

    const ids = await getSelections(screen.id);
    currentGames = await getGames(ids);
    renderGrid(currentGames, screen.layout || 'auto');
    touch('Ligado', true);
  } catch (e){
    console.error('Erro a carregar screen/selections:', e);
    touch('Erro inicial', false);
  }

  // ===== Realtime: reagir a mudanças de seleções e de jogos
  let gamesChannel = null;
  let selChannel = null;

  async function resubscribe(ids){
    // Re-subscrever jogos
    if (gamesChannel) { supabase.removeChannel(gamesChannel); gamesChannel = null; }
    if (!ids.length) return;
    gamesChannel = supabase.channel('games-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=in.(${ids.join(',')})` }, async (payload) => {
        // Atualização incremental
        const row = payload.new;
        const idx = currentGames.findIndex(g => g.id === row.id);
        if (idx >= 0) { currentGames[idx] = { ...currentGames[idx], ...row }; }
        else {
          // game novo passou a estar na lista (raro); refetch total para manter ordem
          currentGames = await getGames(ids);
        }
        renderGrid(currentGames, screen?.layout || 'auto');
        touch('Atualizado', true);
      })
      .subscribe();
  }

  async function setupSelectionSubscription(screenId){
    if (selChannel) { supabase.removeChannel(selChannel); selChannel = null; }
    selChannel = supabase.channel('selections-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scoreboard_selections', filter: `scoreboard_id=eq.${screenId}` }, async () => {
        try{
          const ids = await getSelections(screenId);
          currentGames = await getGames(ids);
          renderGrid(currentGames, screen?.layout || 'auto');
          touch('Seleções atualizadas', true);
          await resubscribe(ids);
        }catch(e){ console.error('Erro ao atualizar seleções:', e); touch('Erro seleções', false); }
      })
      .subscribe();
    // primeira subscrição de jogos, baseada no estado atual
    const ids = await getSelections(screenId);
    await resubscribe(ids);
  }

  if (screen?.id){
    setupSelectionSubscription(screen.id);
  }

  // Re-render em resize/orientação
  let rAF; const onResize=()=>{ cancelAnimationFrame(rAF); rAF=requestAnimationFrame(()=> renderGrid(currentGames, screen?.layout || 'auto')); };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
})();

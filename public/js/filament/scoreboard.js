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

    // estado do encontro
    const set1Concluded = isSetConcluded(sets[0], cfg, 0);
    const set2Concluded = isSetConcluded(sets[1], cfg, 1);
    const set3Concluded = isSetConcluded(sets[2], cfg, 2);
    const [w1, w2] = countWonSets(sets, cfg);
    const matchOver = (w1 >= cfg.setsToWinMatch) || (w2 >= cfg.setsToWinMatch);
    const normalTB  = isNormalTBActive(cur, cfg);
    const superTB   = superTBActive(sets, cfg, matchOver);

    // nomes (duas linhas por equipa)
    const pair1a = escapeHtml(game.player1 || '');
    const pair1b = escapeHtml(game.player2 || '');
    const pair2a = escapeHtml(game.player3 || '');
    const pair2b = escapeHtml(game.player4 || '');

    // última coluna (resultado em curso)
    const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
    const tb1 = Number(cur.tb_team1||0),   tb2 = Number(cur.tb_team2||0);
    const p1 = Number(cur.points_team1||0),p2 = Number(cur.points_team2||0);

    let nowTop = '', nowBot = '', nowLabel = '';
    if (superTB){ nowTop = String(tb1); nowBot = String(tb2); nowLabel = 'STB'; }
    else if (normalTB){ nowTop = String(tb1); nowBot = String(tb2); nowLabel = 'TB'; }
    else { nowTop = String(tennisPoint(p1, cfg.isGP)); nowBot = String(tennisPoint(p2, cfg.isGP)); nowLabel = ''; }

    // que colunas de sets mostrar?
    // - Set 1: mostra só quando CONCLUÍDO
    // - Set 2: só existe se o Set 1 estiver concluído (valor aparece quando concluir)
    // - Set 3: só se Set1 e Set2 concluídos e **ficou 1–1** (no formato super é o STB)
    const cols = [];
    if (set1Concluded) cols.push(0);
    if (set1Concluded) cols.push(1);
    if (set1Concluded && set2Concluded){
        const s1 = sets[0] || {}, s2 = sets[1] || {};
        const t1a = (Number(s1.team1||0) > Number(s1.team2||0)) ? 1 : (Number(s1.team2||0) > Number(s1.team1||0) ? 2 : 0);
        const t2a = (Number(s2.team1||0) > Number(s2.team2||0)) ? 1 : (Number(s2.team2||0) > Number(s2.team1||0) ? 2 : 0);
        if (t1a && t2a && t1a !== t2a) cols.push(2);
    }

    function setCellVal(setIndex, team){ // team: 1 ou 2
        const ss = sets[setIndex];
        if (!ss) return '';
        if (!isSetConcluded(ss, cfg, setIndex)) return '';
        return String(team === 1 ? (ss.team1 ?? '') : (ss.team2 ?? ''));
    }

    // topo do tile (formato + court + estado)
    const courtName = game.court_name
        ? `Campo ${escapeHtml(game.court_name)}`
        : (game.court_id ? `Campo ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');
    const liveBadge = matchOver ? 'Final'
        : ((superTB || normalTB || (g1+g2+p1+p2+tb1+tb2) > 0) ? '<span class="pulse">AO VIVO</span>' : 'Pré-jogo');

    // construir HTML da tabela
    const wrap = document.createElement('div');
    wrap.className = 'tile';

    const rowTopSets = cols.map(i => `<td class="set">${setCellVal(i,1)}</td>`).join('');
    const rowBotSets = cols.map(i => `<td class="set">${setCellVal(i,2)}</td>`).join('');

    wrap.innerHTML = `
        <div class="row">
        <div>
            <span class="badge">${escapeHtml(game.format || 'best_of_3')}</span>
            ${courtName ? `<span class="muted" style="margin-left:8px">• ${courtName}</span>` : ''}
        </div>
        <div>${liveBadge}</div>
        </div>

        <table class="scoretable" aria-label="Scoreboard do jogo">
        <tbody>
            <tr>
            <td class="names">
                <div class="line">${pair1a}</div>
                <div class="line">${pair1b}</div>
            </td>
            ${rowTopSets}
            <td class="now">${nowLabel ? `<small>${nowLabel}</small>` : ''}${nowTop}</td>
            </tr>
            <tr>
            <td class="names">
                <div class="line">${pair2a}</div>
                <div class="line">${pair2b}</div>
            </td>
            ${rowBotSets}
            <td class="now">${nowLabel ? `<small>${nowLabel}</small>` : ''}${nowBot}</td>
            </tr>
        </tbody>
        </table>
    `;

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

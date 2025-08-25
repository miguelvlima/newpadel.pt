// public/js/filament/scoreboard.js (v45 - positions & placeholders em slots, ordem row-major)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(async () => {
  // altura 100vh real (mobile)
  const setAppHeight = () => {
    document.documentElement.style.setProperty('--app-h', `${window.innerHeight}px`);
  };
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);

  const grid = document.getElementById('grid');
  const statusEl = document.getElementById('status');
  const titleEl = document.getElementById('screen-title');

  const SUPABASE_URL  = grid?.dataset?.sbUrl || '';
  const SUPABASE_ANON = grid?.dataset?.sbAnon || '';
  const SCREEN_KEY    = grid?.dataset?.screen || 'default';

  const setVar = (el, name, val) => el.style.setProperty(name, val);
  const getVar = (el, name) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;

  function setScreenTitle(txt){
    const t = (txt && String(txt).trim()) || SCREEN_KEY || 'Scoreboard';
    if (titleEl) titleEl.textContent = t;
    document.title = t;
  }

  document.getElementById('fs')?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  const fmtTime = d => d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  const escapeHtml = (s='') => s.replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const touch = (text, ok) => { if (statusEl) statusEl.innerHTML = `<span class="${ok?'status-ok':'status-bad'}">●</span> ${text} • ${fmtTime(new Date())}`; };

  if (!/^https:\/\/.+\.supabase\.co/i.test(SUPABASE_URL)) {
    console.error('SUPABASE_URL inválida/vazia:', SUPABASE_URL);
    if (statusEl) statusEl.textContent = 'Configuração Supabase inválida (URL).';
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Accept: 'application/json' } },
    realtime: { params: { eventsPerSecond: 5 } }
  });

  /* ======== regras ======== */
  const parseFormat = (fmt) => {
    const f=(fmt||'best_of_3').toLowerCase();
    const isGP=f.endsWith('_gp');
    const isProset=f.startsWith?.('proset') || f.indexOf('proset')===0;
    const isSuper=f.startsWith?.('super_tiebreak') || f.indexOf('super_tiebreak')===0;
    const gamesToWinSet=isProset?9:6;
    const setsToWinMatch=isProset?1:2;
    return {f,isGP,isProset,isSuper,gamesToWinSet,setsToWinMatch};
  };
  const isSetConcluded = (s,cfg,i) => {
    if(!s) return false;
    const t1=Number.isFinite(s.team1)?s.team1:0, t2=Number.isFinite(s.team2)?s.team2:0;
    const maxV=Math.max(t1,t2), minV=Math.min(t1,t2), diff=Math.abs(t1-t2);
    if(cfg.isSuper && i===2) return (maxV>=10)&&(diff>=2);
    if(cfg.isProset) return (maxV>=9)&&(diff>=2);
    if(maxV===7&&(minV===5||minV===6)) return true;
    return (maxV>=cfg.gamesToWinSet)&&(diff>=2);
  };
  const countWonSets = (sets,cfg) => {
    let w1=0,w2=0;
    for(let i=0;i<Math.min(sets.length,3);i++){
      if(isSetConcluded(sets[i],cfg,i)){
        const {team1=0,team2=0}=sets[i]||{};
        if(team1>team2)w1++; else if(team2>team1)w2++;
      }
    }
    return [w1,w2];
  };
  const tennisPoint = (n,gp) => { const map=[0,15,30,40,'AD']; if(!Number.isFinite(n)||n<0) return '—'; return gp?map[Math.min(n,3)]:map[Math.min(n,4)]; };
  const isNormalTBActive = (cur,cfg) => { if(cfg.isProset) return false; const g1=Number(cur?.games_team1||0), g2=Number(cur?.games_team2||0); return g1===cfg.gamesToWinSet && g2===cfg.gamesToWinSet; };
  const superTBActive = (sets,cfg,over) => { if(!cfg.isSuper) return false; const [w1,w2]=countWonSets(sets,cfg); if(over) return false; return (w1===1 && w2===1); };

  /* ======== grid a partir de positions ======== */
  function computeGridFromPositions(n){
    const portrait = window.innerHeight >= window.innerWidth;
    if (n<=1) return [1,1];
    if (n===2) return portrait ? [1,2] : [2,1];
    return [2,2]; // 3 ou 4 -> 2x2 (row-major)
  }

  /* ======== autosize (idêntico ao que tinhas, AGORA = SET) ======== */
  const tileSizer = (typeof ResizeObserver !== 'undefined')
    ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const el = entry.target;
          const rect = entry.contentRect || el.getBoundingClientRect();
          const w = rect?.width || 0, h = rect?.height || 0;
          const base = Math.max(0, Math.min(w, h));

          const fsName = Math.max(18, Math.min(72, base * 0.12));
          const fsSet  = Math.max(24, Math.min(96, base * 0.145));
          const fsHead = Math.max(12, Math.min(26, fsSet * 0.50));
          const fsNow  = fsSet; // NOW = SET

          const fsBadge   = Math.max(12, Math.min(32, base * 0.075));
          const badgePadY = Math.max(4,  Math.min(18, base * 0.038));
          const badgePadX = Math.max(8,  Math.min(28, base * 0.065));

          const gapV = Math.max(6, Math.min(24, base * 0.03));
          const padY = Math.max(8, Math.min(22, base * 0.05));
          const padX = Math.max(10, Math.min(28, base * 0.07));

          setVar(el, '--fs-name',  `${fsName}px`);
          setVar(el, '--fs-set',   `${fsSet}px`);
          setVar(el, '--fs-now',   `${fsNow}px`);
          setVar(el, '--fs-head',  `${fsHead}px`);
          setVar(el, '--fs-badge', `${fsBadge}px`);
          setVar(el, '--badge-pad-y', `${badgePadY}px`);
          setVar(el, '--badge-pad-x', `${badgePadX}px`);
          setVar(el, '--gap-v', `${gapV}px`);
          setVar(el, '--pad-cell-y', `${padY}px`);
          setVar(el, '--pad-cell-x', `${padX}px`);

          requestAnimationFrame(() => {
            fitNames(el);
            fitBadges(el);
            fitTileVertically(el);
          });
        }
      })
    : { observe: () => {} };

  function fitNames(el){
    let fs = getVar(el, '--fs-name') || 22;
    const min = 12; let tries = 0;
    const tooWide = () => [...el.querySelectorAll('td.names .line')].some(d => d.scrollWidth > d.clientWidth);
    while (tooWide() && fs > min && tries < 24){
      fs -= 1; setVar(el, '--fs-name', `${fs}px`); tries++;
    }
  }
  function fitBadges(el){
    const row = el.querySelector('.row'); if (!row) return;
    const left = row.querySelector('.left'); const right = row.querySelector('.right');
    const court = row.querySelector('.badge.court'); const status = row.querySelector('.badge.status');
    if (!left || !right) return;
    let fs = getVar(el, '--fs-badge') || 14; let tries = 0;
    const over = () => (court && court.scrollWidth > left.clientWidth) || (status && status.scrollWidth > right.clientWidth);
    while (over() && fs > 10 && tries < 20){
      fs -= 1; setVar(el, '--fs-badge', `${fs}px`); tries++;
    }
  }
  function shrinkVars(el, factor = 0.93){
    const clamp = (v,min,max) => Math.max(min, Math.min(max, v));
    const fsName = clamp(getVar(el,'--fs-name')*factor, 12, 100);
    const fsSet  = clamp(getVar(el,'--fs-set') *factor, 16, 120);
    const fsNow  = clamp(getVar(el,'--fs-now') *factor, 16, 120);
    const fsHead = clamp(getVar(el,'--fs-head')*factor, 10, 30);
    const gapV   = clamp(getVar(el,'--gap-v')   *factor, 6, 28);
    const padY   = clamp(getVar(el,'--pad-cell-y')*factor, 6, 26);
    const padX   = clamp(getVar(el,'--pad-cell-x')*factor, 8, 30);
    const fsBadge   = clamp(getVar(el,'--fs-badge')*factor, 10, 34);
    const badgePadY = clamp(getVar(el,'--badge-pad-y')*factor, 4, 18);
    const badgePadX = clamp(getVar(el,'--badge-pad-x')*factor, 6, 30);

    setVar(el,'--fs-name',`${fsName}px`);
    setVar(el,'--fs-set', `${fsSet}px`);
    setVar(el,'--fs-now', `${fsNow}px`);
    setVar(el,'--fs-head',`${fsHead}px`);
    setVar(el,'--gap-v', `${gapV}px`);
    setVar(el,'--pad-cell-y',`${padY}px`);
    setVar(el,'--pad-cell-x',`${padX}px`);
    setVar(el,'--fs-badge',`${fsBadge}px`);
    setVar(el,'--badge-pad-y',`${badgePadY}px`);
    setVar(el,'--badge-pad-x',`${badgePadX}px`);
  }
  function fitTileVertically(el){
    let safety = 16;
    const step = () => {
      if (el.scrollHeight <= el.clientHeight || safety-- <= 0) return;
      const gap = getVar(el,'--gap-v');
      const py  = getVar(el,'--pad-cell-y');
      const px  = getVar(el,'--pad-cell-x');
      if (gap > 8 || py > 10 || px > 12){
        setVar(el,'--gap-v', `${Math.max(6, gap*0.95)}px`);
        setVar(el,'--pad-cell-y', `${Math.max(6, py*0.95)}px`);
        setVar(el,'--pad-cell-x', `${Math.max(8, px*0.95)}px`);
        return requestAnimationFrame(step);
      }
      shrinkVars(el, 0.95);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ======== tiles ======== */
  function tile(game){
    const cfg = parseFormat(game.format);
    const s   = game.score || {};
    const sets = Array.isArray(s.sets) ? s.sets.slice(0,3) : [];
    const cur  = s.current || {};

    const setConcluded = [0,1,2].map(i => isSetConcluded(sets[i], cfg, i));
    const currentIndex = setConcluded.filter(Boolean).length;
    const [w1, w2] = countWonSets(sets, cfg);
    const matchOver = (w1 >= cfg.setsToWinMatch) || (w2 >= cfg.setsToWinMatch);
    const normalTB  = isNormalTBActive(cur, cfg);
    const superTB   = superTBActive(sets, cfg, matchOver);

    const pair1a = escapeHtml(game.player1 || ''), pair1b = escapeHtml(game.player2 || '');
    const pair2a = escapeHtml(game.player3 || ''), pair2b = escapeHtml(game.player4 || '');

    const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
    const tb1= Number(cur.tb_team1||0),    tb2= Number(cur.tb_team2||0);
    const p1 = Number(cur.points_team1||0),p2 = Number(cur.points_team2||0);
    let nowTop='', nowBot='', nowTitle='Jogo';
    if (superTB){
      const base1 = Number(sets?.[2]?.team1 || 0);
      const base2 = Number(sets?.[2]?.team2 || 0);
      nowTop = String(tb1 || base1);
      nowBot = String(tb2 || base2);
      nowTitle = 'Super Tie-break';
    } else if (normalTB){
      nowTop = String(tb1); nowBot = String(tb2); nowTitle = 'Tie-break';
    } else {
      nowTop = String(tennisPoint(p1, cfg.isGP));
      nowBot = String(tennisPoint(p2, cfg.isGP));
    }

    const isRegularPlaying = !cfg.isProset && !normalTB && !superTB;
    const cols = []; const titles = [];
    if (cfg.isProset){
      if (setConcluded[0]) { cols.push(0); titles.push('Proset'); }
    } else {
      if (setConcluded[0] || (isRegularPlaying && currentIndex === 0) || (normalTB && currentIndex === 0)){
        cols.push(0); titles.push('1º Set');
      }
      if (setConcluded[0] && (setConcluded[1] || (isRegularPlaying && currentIndex === 1) || (normalTB && currentIndex === 1))){
        cols.push(1); titles.push('2º Set');
      }
      if (setConcluded[2]){
        cols.push(2); titles.push(cfg.isSuper ? 'Super Tie-break' : '3º Set');
      }
    }

    function setCellVal(i, team){
      if (!cfg.isProset && normalTB && i === currentIndex) return '6';           // mostrar 6–6 no TB normal
      if (!cfg.isProset && isRegularPlaying && i === currentIndex) return String(team === 1 ? g1 : g2); // jogos a decorrer
      const ss = sets[i];
      if (!ss || !isSetConcluded(ss, cfg, i)) return '';
      return String(team === 1 ? (ss.team1 ?? '') : (ss.team2 ?? ''));
    }

    const courtName = game.court_name
      ? `${escapeHtml(game.court_name)}`
      : (game.court_id ? `CAMPO ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');

    const anySetFinished = setConcluded.some(Boolean);
    const anySetFilled   = sets.some(ss => (Number(ss?.team1||0) + Number(ss?.team2||0)) > 0);
    const hasCurrent     = (g1+g2+p1+p2+tb1+tb2) > 0;
    const started        = anySetFinished || anySetFilled || hasCurrent;

    const statusText  = matchOver ? 'TERMINADO' : (started ? 'AO VIVO' : 'PRÉ-JOGO');
    const statusInner = (started && !matchOver) ? '<span class="pulse">AO VIVO</span>' : statusText;

    const wrap = document.createElement('div');
    wrap.className = 'tile';

    const headerSetTh = titles.map(t => `<th class="set">${t}</th>`).join('');
    const rowTopSets  = cols.map(i => `<td class="set"><div class="cell">${setCellVal(i,1)}</div></td>`).join('');
    const rowBotSets  = cols.map(i => `<td class="set"><div class="cell">${setCellVal(i,2)}</div></td>`).join('');

    const nowHeader = matchOver ? '' : `<th class="now">${nowTitle}</th>`;
    const nowTopTd  = matchOver ? '' : `<td class="now"><div class="cell-now">${nowTop}</div></td>`;
    const nowBotTd  = matchOver ? '' : `<td class="now"><div class="cell-now">${nowBot}</div></td>`;

    wrap.innerHTML = `
      <div class="row">
        <div class="left">${courtName ? `<span class="badge court">${courtName}</span>` : `<span class="badge court">—</span>`}</div>
        <div class="right"><span class="badge status">${statusInner}</span></div>
      </div>

      <table class="scoretable" aria-label="Scoreboard do jogo">
        <thead>
          <tr>
            <th class="names"></th>
            ${headerSetTh}
            ${nowHeader}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="names">
              <div class="line">${pair1a}</div>
              <div class="line">${pair1b}</div>
            </td>
            ${rowTopSets}
            ${nowTopTd}
          </tr>
          <tr>
            <td class="names">
              <div class="line">${pair2a}</div>
              <div class="line">${pair2b}</div>
            </td>
            ${rowBotSets}
            ${nowBotTd}
          </tr>
        </tbody>
      </table>
    `;
    return wrap;
  }

  function emptyTile(){
    const wrap = document.createElement('div');
    wrap.className = 'tile';
    wrap.innerHTML = `
      <div class="row">
        <div class="left"><span class="badge court">—</span></div>
        <div class="right"><span class="badge status">—</span></div>
      </div>
      <div class="placeholder">Sem jogo configurado</div>
    `;
    return wrap;
  }

  /* ======== DATA / SLOTS ======== */
  async function getScreenByKey(key){
    const { data, error } = await supabase
      .from('scoreboards')
      .select('id, key, title, layout, kiosk, positions')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function getSelectionRows(screenId){
    const { data, error } = await supabase
      .from('scoreboard_selections')
      .select('position, game_id')
      .eq('scoreboard_id', screenId)
      .order('position', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function getGames(ids){
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from('games')
      .select('id,player1,player2,player3,player4,format,score,court_id,created_at')
      .in('id', ids);
    if (error) throw error;
    const games = (data || []);
    const courtIds = [...new Set(games.map(g=>g.court_id).filter(Boolean))];
    if (courtIds.length){
      const { data: courts } = await supabase.from('courts').select('id,name').in('id', courtIds);
      const map = new Map((courts||[]).map(c=>[c.id,c.name]));
      for (const g of games){ if (g.court_id && map.has(g.court_id)) g.court_name = map.get(g.court_id); }
    }
    return games;
  }

  async function buildSlots(screen){
    const rows = await getSelectionRows(screen.id);
    const rawPositions = Number(screen?.positions) || rows.length || 1;
    const positions = Math.max(1, Math.min(4, rawPositions)); // 1..4
    const ids = rows.map(r => r.game_id).filter(Boolean);
    const games = await getGames(ids);
    const gmap = new Map(games.map(g=>[g.id, g]));
    // slots 1..positions, por ordem row-major
    const slots = Array.from({length: positions}, (_, i) => {
      const row = rows.find(r => Number(r.position) === i+1);
      if (row && row.game_id && gmap.has(row.game_id)) return gmap.get(row.game_id);
      return null; // placeholder
    });
    return { slots, positions, ids };
  }

  /* ======== RENDER ======== */
  function renderGridSlots(slots, positions){
    grid.innerHTML = '';
    const [cols, rows] = computeGridFromPositions(positions);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
    slots.forEach(item => {
      const el = item ? tile(item) : emptyTile();
      grid.appendChild(el);
      try { tileSizer.observe(el); } catch {}
    });
  }

  /* ======== bootstrap + realtime ======== */
  let currentSlots = [];
  let currentIds = [];
  let screen = null;

  async function reloadAll(){
    const pack = await buildSlots(screen);
    currentSlots = pack.slots;
    currentIds   = pack.ids;
    renderGridSlots(currentSlots, pack.positions);
  }

  try {
    screen = await getScreenByKey(SCREEN_KEY);
    setScreenTitle(screen?.title);
    if (screen?.kiosk) document.body.classList.add('hide-cursor');
    await reloadAll();
    touch('Ligado', true);
  } catch (e) {
    console.error('Erro a carregar screen/selections:', e);
    setScreenTitle(SCREEN_KEY);
    touch('Erro inicial', false);
  }

  // seleções: trocar jogos/posições
  let selChannel = null;
  async function setupSelectionSubscription(screenId){
    if (selChannel) { supabase.removeChannel(selChannel); selChannel = null; }
    selChannel = supabase.channel('selections-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scoreboard_selections', filter: `scoreboard_id=eq.${screenId}` }, async () => {
        try{ await reloadAll(); touch('Seleções atualizadas', true); await resubscribe(currentIds); }
        catch(e){ console.error('Erro ao atualizar seleções:', e); touch('Erro seleções', false); }
      })
      .subscribe();
  }

  // jogos em tempo real
  let gamesChannel = null;
  async function resubscribe(ids){
    if (gamesChannel) { supabase.removeChannel(gamesChannel); gamesChannel = null; }
    if (!ids.length) return;
    gamesChannel = supabase.channel('games-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=in.(${ids.join(',')})` }, async (payload) => {
        const row = payload.new;
        const idx = currentSlots.findIndex(g => g && g.id === row.id);
        if (idx >= 0) currentSlots[idx] = { ...currentSlots[idx], ...row };
        else await reloadAll();
        renderGridSlots(currentSlots, (screen?.positions) || currentSlots.length || 1);
        touch('Atualizado', true);
      })
      .subscribe();
  }

  // meta do ecrã (título/positions/kiosk)
  if (screen?.id){
    supabase.channel('screen-meta-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scoreboards', filter: `id=eq.${screen.id}` },
        async (payload) => {
          const row = payload.new || payload.old;
          if (row?.title) setScreenTitle(row.title);
          if (row && typeof row.positions !== 'undefined') {
            screen.positions = row.positions;
            await reloadAll();
          }
          if (row?.kiosk) document.body.classList.add('hide-cursor');
        })
      .subscribe();
    setupSelectionSubscription(screen.id);
    const pack = await buildSlots(screen);
    currentIds = pack.ids;
    await resubscribe(currentIds);
  }

  let rAF; const onResize=()=>{ cancelAnimationFrame(rAF); rAF=requestAnimationFrame(()=> renderGridSlots(currentSlots, (screen?.positions)||currentSlots.length||1)); };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
})();

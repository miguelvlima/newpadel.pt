// public/js/filament/scoreboard.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(async () => {
  // Altura real do viewport (corrige barras do browser em mobile)
  const setVH = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);

  const grid = document.getElementById('grid');
  const statusEl = document.getElementById('status');
  const titleEl = document.getElementById('screen-title');

  const SUPABASE_URL  = grid?.dataset?.sbUrl || '';
  const SUPABASE_ANON = grid?.dataset?.sbAnon || '';
  const SCREEN_KEY    = grid?.dataset?.screen || 'default';

  function setScreenTitle(txt){
    const t = (txt && String(txt).trim()) || SCREEN_KEY || 'Scoreboard';
    if (titleEl) titleEl.textContent = t;
    document.title = t;
  }

  document.getElementById('fs')?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  function fmtTime(d){ return d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
  function escapeHtml(s=''){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function touch(text, ok){ if (statusEl) statusEl.innerHTML = `<span class="${ok?'status-ok':'status-bad'}">●</span> ${text} • ${fmtTime(new Date())}`; }

  if (!/^https:\/\/.+\.supabase\.co/i.test(SUPABASE_URL)) {
    console.error('SUPABASE_URL inválida/vazia:', SUPABASE_URL);
    if (statusEl) statusEl.textContent = 'Configuração Supabase inválida (URL).';
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
    global: { headers: { Accept: 'application/json' } },
    realtime: { params: { eventsPerSecond: 5 } }
  });

  // ======== Regras padel/tenis ========
  function parseFormat(fmt){
    const f=(fmt||'best_of_3').toLowerCase();
    const isGP=f.endsWith('_gp');
    const isProset=f.startsWith('proset');
    const isSuper=f.startsWith('super_tiebreak');
    const gamesToWinSet=isProset?9:6;
    const setsToWinMatch=isProset?1:2;
    return {f,isGP,isProset,isSuper,gamesToWinSet,setsToWinMatch};
  }
  function isSetConcluded(s,cfg,i){
    if(!s) return false;
    const t1=Number.isFinite(s.team1)?s.team1:0, t2=Number.isFinite(s.team2)?s.team2:0;
    const maxV=Math.max(t1,t2), minV=Math.min(t1,t2), diff=Math.abs(t1-t2);
    if(cfg.isSuper && i===2) return (maxV>=10)&&(diff>=2);
    if(cfg.isProset) return (maxV>=9)&&(diff>=2);
    if(maxV===7&&(minV===5||minV===6)) return true;
    return (maxV>=cfg.gamesToWinSet)&&(diff>=2);
  }
  function countWonSets(sets,cfg){
    let w1=0,w2=0;
    for(let i=0;i<Math.min(sets.length,3);i++){
      if(isSetConcluded(sets[i],cfg,i)){
        const {team1=0,team2=0}=sets[i]||{};
        if(team1>team2)w1++; else if(team2>team1)w2++;
      }
    }
    return [w1,w2];
  }
  function tennisPoint(n,gp){ const map=[0,15,30,40,'AD']; if(!Number.isFinite(n)||n<0) return '—'; return gp?map[Math.min(n,3)]:map[Math.min(n,4)]; }
  function isNormalTBActive(cur,cfg){
    if(cfg.isProset) return false;
    const g1=Number(cur?.games_team1||0), g2=Number(cur?.games_team2||0);
    return g1===cfg.gamesToWinSet && g2===cfg.gamesToWinSet;
  }
  function superTBActive(sets,cfg,over){
    if(!cfg.isSuper) return false;
    const [w1,w2]=countWonSets(sets,cfg);
    if(over) return false;
    return (w1===1 && w2===1);
  }

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

  // === dimensionamento automático por tile (com fallback seguro) ===
  const tileSizer = (typeof ResizeObserver !== 'undefined')
    ? new ResizeObserver((entries) => {
        for (const entry of entries) {
          const el = entry.target;
          const rect = entry.contentRect || el.getBoundingClientRect();
          const w = rect?.width || 0, h = rect?.height || 0;
          const base = Math.max(0, Math.min(w, h));

          const fsName = Math.max(16, Math.min(50, base * 0.10)); // nomes
          const fsSet  = Math.max(18, Math.min(62, base * 0.105)); // sets
          const fsNow  = Math.max(26, Math.min(86, base * 0.15));  // AGORA
          const fsHead = Math.max(14, Math.min(18, fsSet * 0.45)); // cabeçalhos
          const fsBadge = Math.max(12, Math.min(22, base * 0.05)); // ajuste a gosto

          el.style.setProperty('--fs-badge', `${fsBadge}px`);
          el.style.setProperty('--fs-name', `${fsName}px`);
          el.style.setProperty('--fs-set',  `${fsSet}px`);
          el.style.setProperty('--fs-now',  `${fsNow}px`);
          el.style.setProperty('--fs-head', `${fsHead}px`);

          requestAnimationFrame(() => fitNamesAndBadge(el));
          requestAnimationFrame(() => fitTileVertically(el));

        }
      })
    : { observe: () => {} };

// --- shrink progressivo por tile (fontes + gaps + paddings) ---
    function shrinkVars(el, factor = 0.93){
        const cs = getComputedStyle(el);
        const get = name => parseFloat(cs.getPropertyValue(name)) || 0;
        const clamp = (v,min,max) => Math.max(min, Math.min(max, v));

        const fsName = clamp(get('--fs-name') * factor, 12, 80);
        const fsSet  = clamp(get('--fs-set')  * factor, 14, 90);
        const fsNow  = clamp(get('--fs-now')  * factor, 18, 110);
        const fsHead = clamp(get('--fs-head') * factor, 10, 24);

        const gapV   = clamp(parseFloat(cs.getPropertyValue('--gap-v'))     * factor, 4, 20);
        const padY   = clamp(parseFloat(cs.getPropertyValue('--pad-cell-y'))* factor, 4, 20);
        const padX   = clamp(parseFloat(cs.getPropertyValue('--pad-cell-x'))* factor, 6, 24);

        el.style.setProperty('--fs-name', `${fsName}px`);
        el.style.setProperty('--fs-set',  `${fsSet}px`);
        el.style.setProperty('--fs-now',  `${fsNow}px`);
        el.style.setProperty('--fs-head', `${fsHead}px`);

        el.style.setProperty('--gap-v', `${gapV}px`);
        el.style.setProperty('--pad-cell-y', `${padY}px`);
        el.style.setProperty('--pad-cell-x', `${padX}px`);
    }

    function fitTileVertically(el){
        // encolhe até caber dentro do tile (sem mexer no layout global)
        let safety = 10;
        // mede depois de pintar
        const tryFit = () => {
            if (el.scrollHeight <= el.clientHeight || safety-- <= 0) return;
            shrinkVars(el, 0.93);
            requestAnimationFrame(tryFit);
        };
        requestAnimationFrame(tryFit);
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
      try { tileSizer.observe(ph); } catch {}
      return;
    }

    games.forEach(g => {
      const el = tile(g);
      grid.appendChild(el);

        try { tileSizer.observe(el); } catch {}
        fitNamesAndBadge(el);
        fitTileVertically(el);

    });

    const target = cols*rows;
    for (let i=n; i<target; i++){
      const ph=document.createElement('div'); ph.className='tile placeholder'; grid.appendChild(ph);
      try { tileSizer.observe(ph); } catch {}
    }
  }

  function fitNamesAndBadge(el){
    // encolhe --fs-name se alguma linha dos nomes fizer overflow
    let fs = parseFloat(getComputedStyle(el).getPropertyValue('--fs-name')) || 22;
    const min = 12; let tries = 0;
    const tooWide = () => [...el.querySelectorAll('td.names .line')]
                            .some(d => d.scrollWidth > d.clientWidth);
    while (tooWide() && fs > min && tries < 18){
        fs -= 1; el.style.setProperty('--fs-name', `${fs}px`); tries++;
    }
    // badge (campo)
    const badge = el.querySelector('.badge');
    if (badge){
        let fb = parseFloat(getComputedStyle(el).getPropertyValue('--fs-badge')) || 14;
        let btries = 0;
        const bWide = () => badge.scrollWidth > badge.clientWidth;
        while (bWide() && fb > 10 && btries < 10){
        fb -= 1; el.style.setProperty('--fs-badge', `${fb}px`); btries++;
        }
    }
    }


  // ======== Render de um jogo ========
  function tile(game){
    const cfg = parseFormat(game.format);
    const s = game.score || {};
    const sets = Array.isArray(s.sets) ? s.sets.slice(0,3) : [];
    const cur  = s.current || {};
    const statusLabel = matchOver ? 'Terminado' : (started ? 'Ao vivo' : 'Pré-jogo');

    // estados
    const setConcluded = [0,1,2].map(i => isSetConcluded(sets[i], cfg, i));
    const currentIndex = setConcluded.filter(Boolean).length; // 0..2
    const [w1, w2] = countWonSets(sets, cfg);
    const matchOver = (w1 >= cfg.setsToWinMatch) || (w2 >= cfg.setsToWinMatch);
    const normalTB  = isNormalTBActive(cur, cfg);
    const superTB   = superTBActive(sets, cfg, matchOver);

    // nomes
    const pair1a = escapeHtml(game.player1 || ''), pair1b = escapeHtml(game.player2 || '');
    const pair2a = escapeHtml(game.player3 || ''), pair2b = escapeHtml(game.player4 || '');

    // “agora”
    const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
    const tb1= Number(cur.tb_team1||0),    tb2= Number(cur.tb_team2||0);
    const p1 = Number(cur.points_team1||0),p2 = Number(cur.points_team2||0);
    let nowTop='', nowBot='', nowTitle='Jogo';
    if (superTB){
      const base1 = Number(sets?.[2]?.team1 || 0);
      const base2 = Number(sets?.[2]?.team2 || 0);
      const show1 = (tb1 || base1);
      const show2 = (tb2 || base2);
      nowTop=String(show1); nowBot=String(show2); nowTitle='Super Tie-break';
    }
    else if (normalTB){ nowTop=String(tb1); nowBot=String(tb2); nowTitle='Tie-break'; }
    else { nowTop=String(tennisPoint(p1, cfg.isGP)); nowBot=String(tennisPoint(p2, cfg.isGP)); }

    const isRegularPlaying = !cfg.isProset && !normalTB && !superTB;

    const cols = [];
    const titles = [];

    if (cfg.isProset){
      if (setConcluded[0]) { cols.push(0); titles.push('Proset'); }
    } else {
      if (setConcluded[0] || (isRegularPlaying && currentIndex === 0) || (normalTB && currentIndex === 0)) {
        cols.push(0); titles.push('1º Set');
      }
      if (setConcluded[0] && (setConcluded[1] || (isRegularPlaying && currentIndex === 1) || (normalTB && currentIndex === 1))) {
        cols.push(1); titles.push('2º Set');
      }
      if (setConcluded[2]) {
        cols.push(2); titles.push(cfg.isSuper ? 'Super Tie-break' : '3º Set');
      }
    }

    function setCellVal(i, team){
      if (!cfg.isProset && normalTB && i === currentIndex) return '6';
      if (!cfg.isProset && isRegularPlaying && i === currentIndex) {
        return String(team === 1 ? g1 : g2);
      }
      const ss = sets[i];
      if (!ss || !isSetConcluded(ss, cfg, i)) return '';
      return String(team === 1 ? (ss.team1 ?? '') : (ss.team2 ?? ''));
    }

    const courtName = game.court_name
      ? `Campo ${escapeHtml(game.court_name)}`
      : (game.court_id ? `Campo ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');
    const anySetFinished = setConcluded.some(Boolean);
    const anySetFilled   = sets.some(ss => (Number(ss?.team1||0) + Number(ss?.team2||0)) > 0);
    const hasCurrent     = (g1+g2+p1+p2+tb1+tb2) > 0;
    const started        = anySetFinished || anySetFilled || hasCurrent;
    const liveBadge      = matchOver ? 'Terminado' : (started ? '<span class="pulse">AO VIVO</span>' : 'Pré-jogo');

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
    <div>${courtName ? `<span class="badge court">${courtName}</span>` : ''}</div>
    <div>
        <span class="badge status">
        ${ started ? '<span class="pulse">AO VIVO</span>' : statusLabel }
        </span>
    </div>
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

  // ========== DATA: screen -> selections -> games (+courts) ==========
  async function getScreenByKey(key){
    const { data, error } = await supabase
      .from('scoreboards')
      .select('id, key, title, layout, kiosk')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data || null;
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
    setScreenTitle(screen?.title);
    if (screen?.kiosk) document.body.classList.add('hide-cursor');

    const ids = screen ? await getSelections(screen.id) : [];
    currentGames = await getGames(ids);
    renderGrid(currentGames, screen?.layout || 'auto');
    touch('Ligado', true);
  } catch (e) {
    console.error('Erro a carregar screen/selections:', e);
    setScreenTitle(SCREEN_KEY);
    touch('Erro inicial', false);
  }

  // ===== Realtime: reagir a mudanças de seleções e de jogos
  let gamesChannel = null;
  let selChannel = null;

  async function resubscribe(ids){
    if (gamesChannel) { supabase.removeChannel(gamesChannel); gamesChannel = null; }
    if (!ids.length) return;
    gamesChannel = supabase.channel('games-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=in.(${ids.join(',')})` }, async (payload) => {
        const row = payload.new;
        const idx = currentGames.findIndex(g => g.id === row.id);
        if (idx >= 0) {
          currentGames[idx] = { ...currentGames[idx], ...row };
        } else {
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
    const ids = await getSelections(screenId);
    await resubscribe(ids);
  }

  if (screen?.id){
    supabase.channel('screen-meta-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scoreboards', filter: `id=eq.${screen.id}` },
        (payload) => {
          const row = payload.new || payload.old;
          if (row?.title) setScreenTitle(row.title);
          if (row?.kiosk) document.body.classList.add('hide-cursor');
        })
      .subscribe();
    setupSelectionSubscription(screen.id);
  }

  let rAF; const onResize=()=>{ cancelAnimationFrame(rAF); rAF=requestAnimationFrame(()=> renderGrid(currentGames, screen?.layout || 'auto')); };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
})();

// public/js/filament/scoreboard.js (v50: finished-last-set-to-right, right-align block, proset same size)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

(async () => {
  /* ---------- viewport height fix (mobile 100vh) ---------- */
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

  /* ---------- regras padel ---------- */
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

  /* ---------- grid a partir de positions ---------- */
  function computeGridFromPositions(n){
    const portrait = window.innerHeight >= window.innerWidth;
    if (n<=1) return [1,1];
    if (n===2) return portrait ? [1,2] : [2,1];
    return [2,2]; // 3 ou 4 -> 2x2
  }

  /* ---------- autosize (NOW = SET) ---------- */
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
          const fsNow  = fsSet;

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

  function calibrateTile(el){
    fitNames(el); fitBadges(el); fitTileVertically(el);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { fitNames(el); fitBadges(el); fitTileVertically(el); });
    }
    setTimeout(() => { fitNames(el); fitBadges(el); fitTileVertically(el); }, 120);
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

  /* ---------- shape/key ---------- */
  function computeShape(game){
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
    const isRegularPlaying = !cfg.isProset && !normalTB && !superTB;

    // determine last concluded set
    let lastConcludedIndex = -1;
    for (let i=2;i>=0;i--){ if (setConcluded[i]) { lastConcludedIndex = i; break; } }
    if (cfg.isProset && setConcluded[0]) lastConcludedIndex = 0;

    const cols = [];
    const titles = [];
    if (cfg.isProset){
      // during play we don't show a set column; if finished we'll show in NOW
      if (!matchOver && setConcluded[0]) { cols.push(0); titles.push('Proset'); }
    } else {
      if (setConcluded[0] || (isRegularPlaying && currentIndex === 0) || (normalTB && currentIndex === 0)){
        cols.push(0); titles.push('1º Set');
      }
      if (setConcluded[0] && (setConcluded[1] || (isRegularPlaying && currentIndex === 1) || (normalTB && currentIndex === 1))){
        cols.push(1); titles.push('2º Set');
      }
      if (!cfg.isSuper) {
        if (setConcluded[2] || (isRegularPlaying && currentIndex === 2) || (normalTB && currentIndex === 2)) {
          cols.push(2); titles.push('3º Set');
        }
      } else {
        if (setConcluded[2]) { cols.push(2); titles.push('Super Tie-break'); }
      }
    }

    // If match over: move the last concluded set to NOW column on the right
    let useFinishedAsNow = false;
    let finishedNowIndex = -1;
    let finishedNowTitle = '';
    if (matchOver && lastConcludedIndex >= 0){
      useFinishedAsNow = true;
      finishedNowIndex = lastConcludedIndex;
      if (cfg.isProset) finishedNowTitle = 'Proset';
      else if (finishedNowIndex === 0) finishedNowTitle = '1º Set';
      else if (finishedNowIndex === 1) finishedNowTitle = '2º Set';
      else finishedNowTitle = cfg.isSuper ? 'Super Tie-break' : '3º Set';

      // remove that set from the regular set columns to avoid duplication
      const outCols = []; const outTitles = [];
      for (let k=0;k<cols.length;k++){
        if (cols[k] === finishedNowIndex) continue;
        outCols.push(cols[k]); outTitles.push(titles[k]);
      }
      while (cols.length) cols.pop();
      while (titles.length) titles.pop();
      outCols.forEach(v=>cols.push(v));
      outTitles.forEach(v=>titles.push(v));
    }

    const nowTitle = useFinishedAsNow
      ? finishedNowTitle
      : (superTB ? 'Super Tie-break' : (normalTB ? 'Tie-break' : 'Jogo'));
    const showNow  = useFinishedAsNow || !matchOver;

    const shapeKey = [
      cfg.isProset ? 'P' : 'N',
      titles.join('|') || '-',
      useFinishedAsNow ? `LAST=${finishedNowTitle}` : ''
    ].join('#');

    return {
      cfg, sets, cur,
      setConcluded, currentIndex, w1, w2, matchOver, normalTB, superTB, isRegularPlaying,
      cols, titles, nowTitle, showNow,
      useFinishedAsNow, finishedNowIndex, finishedNowTitle
    };
  }

  const CSS_VARS = ['--fs-name','--fs-set','--fs-now','--fs-head','--fs-badge','--badge-pad-y','--badge-pad-x','--gap-v','--pad-cell-y','--pad-cell-x'];
  function copyVars(src, dst){
    const cs = getComputedStyle(src);
    CSS_VARS.forEach(v => dst.style.setProperty(v, cs.getPropertyValue(v)));
  }

  /* ---------- construir/atualizar tile ---------- */
  function buildTile(game){
    const meta = computeShape(game);

    const pair1a = escapeHtml(game.player1 || ''), pair1b = escapeHtml(game.player2 || '');
    const pair2a = escapeHtml(game.player3 || ''), pair2b = escapeHtml(game.player4 || '');

    const courtName = game.court_name
      ? `${escapeHtml(game.court_name)}`
      : (game.court_id ? `CAMPO ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');

    const { cfg, sets, cur, setConcluded, currentIndex, matchOver, normalTB, superTB, isRegularPlaying } = meta;

    const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
    const tb1= Number(cur.tb_team1||0),    tb2= Number(cur.tb_team2||0);
    const p1 = Number(cur.points_team1||0),p2 = Number(cur.points_team2||0);

    let nowTop='', nowBot='';
    if (meta.useFinishedAsNow){
      const ls = sets[meta.finishedNowIndex] || {};
      nowTop = String(ls.team1 ?? '');
      nowBot = String(ls.team2 ?? '');
    } else if (superTB){
      const base1 = Number(sets?.[2]?.team1 || 0);
      const base2 = Number(sets?.[2]?.team2 || 0);
      nowTop = String(tb1 || base1);
      nowBot = String(tb2 || base2);
    } else if (normalTB){
      nowTop = String(tb1); nowBot = String(tb2);
    } else {
      nowTop = String(tennisPoint(p1, cfg.isGP));
      nowBot = String(tennisPoint(p2, cfg.isGP));
    }

    const anySetFinished = setConcluded.some(Boolean);
    const anySetFilled   = sets.some(ss => (Number(ss?.team1||0) + Number(ss?.team2||0)) > 0);
    const hasCurrent     = (g1+g2+p1+p2+tb1+tb2) > 0;
    const started        = anySetFinished || anySetFilled || hasCurrent;
    const statusText  = matchOver ? 'TERMINADO' : (started ? 'AO VIVO' : 'PRÉ-JOGO');
    const statusInner = (started && !matchOver) ? '<span class="pulse">AO VIVO</span>' : statusText;

    const wrap = document.createElement('div');
    wrap.className = 'tile';
    wrap.dataset.gameId = game.id;
    wrap.dataset.shapeKey = meta.shapeKey;

    const headerSetTh = meta.titles.map(t => `<th class="set">${t}</th>`).join('');

    function setCellVal(i, team){
      if (!cfg.isProset && meta.normalTB && i === meta.currentIndex) return '6';
      if (!cfg.isProset && meta.isRegularPlaying && i === meta.currentIndex){
        return String(team === 1 ? g1 : g2);
      }
      const ss = sets[i];
      if (!ss || !isSetConcluded(ss, cfg, i)) return '';
      return String(team === 1 ? (ss.team1 ?? '') : (ss.team2 ?? ''));
    }
    const rowTopSets  = meta.cols.map(i => `<td class="set"><div class="cell">${setCellVal(i,1)}</div></td>`).join('');
    const rowBotSets  = meta.cols.map(i => `<td class="set"><div class="cell">${setCellVal(i,2)}</div></td>`).join('');
    const nowHeader = `<th class="now">${meta.nowTitle}</th>`;
    const nowTopTd  = `<td class="now"><div class="cell-now">${nowTop}</div></td>`;
    const nowBotTd  = `<td class="now"><div class="cell-now">${nowBot}</div></td>`;

    // flexfill column to push set block to the right
    wrap.innerHTML = `
      <div class="row">
        <div class="left">${courtName ? `<span class="badge court">${courtName}</span>` : `<span class="badge court">—</span>`}</div>
        <div class="right"><span class="badge status">${statusInner}</span></div>
      </div>

      <table class="scoretable" aria-label="Scoreboard do jogo">
        <thead>
          <tr>
            <th class="names"></th>
            <th class="flexfill"></th>
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
            <td class="flexfill"></td>
            ${rowTopSets}
            ${nowTopTd}
          </tr>
          <tr>
            <td class="names">
              <div class="line">${pair2a}</div>
              <div class="line">${pair2b}</div>
            </td>
            <td class="flexfill"></td>
            ${rowBotSets}
            ${nowBotTd}
          </tr>
        </tbody>
      </table>
    `;

    // Mostrar/ocultar “AGORA” visualmente (sem reflow)
    const thNow = wrap.querySelector('th.now');
    const tdNowEls = wrap.querySelectorAll('td.now');
    if (!meta.showNow) {
      thNow?.classList.add('is-hidden');
      tdNowEls.forEach(n => n.classList.add('is-hidden'));
    }

    return wrap;
  }

  function updateTile(el, game){
    const meta = computeShape(game);

    const thNow = el.querySelector('th.now');
    if (thNow) thNow.textContent = meta.nowTitle;

    const tdNowEls = el.querySelectorAll('td.now');
    tdNowEls.forEach(n => n.classList.toggle('is-hidden', !meta.showNow));
    if (thNow) thNow.classList.toggle('is-hidden', !meta.showNow);

    const oldKey = el.dataset.shapeKey;
    if (oldKey !== meta.shapeKey){
      const replacement = buildTile(game);
      copyVars(el, replacement);
      el.replaceWith(replacement);
      try { tileSizer.observe(replacement); } catch {}
      calibrateTile(replacement);
      return replacement;
    }

    el.dataset.gameId = game.id;

    const row = el.querySelector('.row');
    const courtBadge = row?.querySelector('.badge.court');
    const statusBadge = row?.querySelector('.badge.status');
    const courtName = game.court_name
      ? `${escapeHtml(game.court_name)}`
      : (game.court_id ? `CAMPO ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');
    if (courtBadge) courtBadge.textContent = courtName || '—';

    const { cfg, sets, cur } = meta;
    const g1 = Number(cur.games_team1||0), g2 = Number(cur.games_team2||0);
    const tb1= Number(cur.tb_team1||0),    tb2= Number(cur.tb_team2||0);
    const p1 = Number(cur.points_team1||0),p2 = Number(cur.points_team2||0);

    // status text
    const anySetFinished = meta.setConcluded.some(Boolean);
    const anySetFilled   = sets.some(ss => (Number(ss?.team1||0) + Number(ss?.team2||0)) > 0);
    const hasCurrent     = (g1+g2+p1+p2+tb1+tb2) > 0;
    const started        = anySetFinished || anySetFilled || hasCurrent;
    const statusText  = meta.matchOver ? 'TERMINADO' : (started ? 'AO VIVO' : 'PRÉ-JOGO');
    if (statusBadge){
      statusBadge.innerHTML = (started && !meta.matchOver) ? '<span class="pulse">AO VIVO</span>' : statusText;
    }

    // names
    const [n1a,n1b,n2a,n2b] = [
      game.player1||'', game.player2||'', game.player3||'', game.player4||''
    ].map(escapeHtml);
    const nameLines = el.querySelectorAll('td.names .line');
    if (nameLines[0]) nameLines[0].textContent = n1a;
    if (nameLines[1]) nameLines[1].textContent = n1b;
    if (nameLines[2]) nameLines[2].textContent = n2a;
    if (nameLines[3]) nameLines[3].textContent = n2b;

    // NOW values
    let nowTop='', nowBot='';
    if (meta.useFinishedAsNow){
      const ls = sets[meta.finishedNowIndex] || {};
      nowTop = String(ls.team1 ?? '');
      nowBot = String(ls.team2 ?? '');
    } else if (meta.superTB){
      const base1 = Number(sets?.[2]?.team1 || 0);
      const base2 = Number(sets?.[2]?.team2 || 0);
      nowTop = String(tb1 || base1);
      nowBot = String(tb2 || base2);
    } else if (meta.normalTB){
      nowTop = String(tb1); nowBot = String(tb2);
    } else {
      nowTop = String(tennisPoint(p1, cfg.isGP));
      nowBot = String(tennisPoint(p2, cfg.isGP));
    }
    const nowCells = el.querySelectorAll('td.now .cell-now');
    if (nowCells[0]) nowCells[0].textContent = nowTop;
    if (nowCells[1]) nowCells[1].textContent = nowBot;

    // set cells
    const setCells = el.querySelectorAll('td.set .cell');
    function setCellVal(i, team){
      if (!cfg.isProset && meta.normalTB && i === meta.currentIndex) return '6';
      if (!cfg.isProset && meta.isRegularPlaying && i === meta.currentIndex){
          const g1 = Number(meta.cur.games_team1||0), g2 = Number(meta.cur.games_team2||0);
          return String(team === 1 ? g1 : g2);
      }
      const ss = sets[i];
      if (!ss || !isSetConcluded(ss, cfg, i)) return '';
      return String(team === 1 ? (ss.team1 ?? '') : (ss.team2 ?? ''));
    }
    const n = meta.cols.length;
    for (let c = 0; c < n; c++) {
      const i = meta.cols[c];
      const topEl = setCells[c];
      const botEl = setCells[n + c];
      if (topEl) topEl.textContent = setCellVal(i, 1);
      if (botEl) botEl.textContent = setCellVal(i, 2);
    }

    return el;
  }

  /* ---------- placeholder por posição ---------- */
  function emptyTile(){
    const wrap = document.createElement('div');
    wrap.className = 'tile';
    wrap.dataset.type = 'empty';
    wrap.innerHTML = `
      <div class="row">
        <div class="left"><span class="badge court">—</span></div>
        <div class="right"><span class="badge status">—</span></div>
      </div>
      <div class="placeholder">Sem jogo configurado</div>
    `;
    return wrap;
  }

  /* ---------- data / slots ---------- */
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
    const positions = Math.max(1, Math.min(4, rawPositions));
    const ids = rows.map(r => r.game_id).filter(Boolean);
    const games = await getGames(ids);
    const gmap = new Map(games.map(g=>[g.id, g]));
    const slots = Array.from({length: positions}, (_, i) => {
      const row = rows.find(r => Number(r.position) === i+1);
      if (row && row.game_id && gmap.has(row.game_id)) return gmap.get(row.game_id);
      return null;
    });
    return { slots, positions, ids };
  }

  /* ---------- render persistente ---------- */
  let tileEls = [];
  function renderGridSlots(slots, positions){
    const [cols, rows] = computeGridFromPositions(positions);
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;

    if (tileEls.length !== positions){
      grid.innerHTML = '';
      tileEls = Array.from({length: positions}, (_, i) => {
        const item = slots[i];
        const el = item ? buildTile(item) : emptyTile();
        grid.appendChild(el);
        try { tileSizer.observe(el); } catch {}
        calibrateTile(el);
        return el;
      });
      return;
    }

    for (let i=0;i<positions;i++){
      const item = slots[i];
      const el = tileEls[i];
      if (!item){
        if (el?.dataset?.type !== 'empty'){
          const rep = emptyTile();
          copyVars(el, rep);
          el.replaceWith(rep);
          try { tileSizer.observe(rep); } catch {}
          calibrateTile(rep);
          tileEls[i] = rep;
        }
        continue;
      }
      if (!el || el.dataset.type === 'empty' || el.dataset.gameId !== item.id){
        const rep = buildTile(item);
        if (el) copyVars(el, rep);
        if (el && el.parentNode) el.replaceWith(rep); else grid.appendChild(rep);
        try { tileSizer.observe(rep); } catch {}
        calibrateTile(rep);
        tileEls[i] = rep;
      } else {
        tileEls[i] = updateTile(el, item);
      }
    }
  }

  /* ---------- bootstrap & realtime ---------- */
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

  let selChannel = null;
  function handleSelectionChange(){
    reloadAll().then(() => { touch('Seleções atualizadas', true); return resubscribe(currentIds); })
               .catch(e => { console.error('Erro ao atualizar seleções:', e); touch('Erro seleções', false); });
  }
  async function setupSelectionSubscription(screenId){
    if (selChannel) { supabase.removeChannel(selChannel); selChannel = null; }
    selChannel = supabase.channel('selections-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scoreboard_selections', filter: `scoreboard_id=eq.${screenId}` }, handleSelectionChange)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scoreboard_selections', filter: `scoreboard_id=eq.${screenId}` }, handleSelectionChange)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scoreboard_selections' }, async (payload) => {
        if (payload?.old?.scoreboard_id && payload.old.scoreboard_id !== screenId) return;
        handleSelectionChange();
      })
      .subscribe();
  }

  let gamesChannel = null;
  async function resubscribe(ids){
    if (gamesChannel) { supabase.removeChannel(gamesChannel); gamesChannel = null; }
    if (!ids.length) return;
    gamesChannel = supabase.channel('games-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=in.(${ids.join(',')})` }, async (payload) => {
        const row = payload.new;
        const idx = currentSlots.findIndex(g => g && g.id === row.id);
        if (idx >= 0) {
          currentSlots[idx] = { ...currentSlots[idx], ...row };
          const el = tileEls[idx];
          if (el){
            const rep = updateTile(el, currentSlots[idx]);
            tileEls[idx] = rep;
          }
        } else {
          await reloadAll();
        }
        touch('Atualizado', true);
      })
      .subscribe();
  }

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
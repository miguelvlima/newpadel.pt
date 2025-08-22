// public/js/scoreboard.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ----- Config lida dos data-attributes -----
const grid = document.getElementById('grid');
const statusEl = document.getElementById('status');
const SUPABASE_URL  = grid?.dataset?.sbUrl || '';
const SUPABASE_ANON = grid?.dataset?.sbAnon || '';

document.getElementById('fs')?.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});

// ----- Query params -----
const params = new URLSearchParams(location.search);
const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ids = (params.get('ids') || '')
  .split(',')
  .map(s => s.trim())
  .filter(x => uuidRe.test(x))
  .slice(0, 4);
const kiosk = params.get('kiosk') === '1';
if (kiosk) document.body.classList.add('hide-cursor');

// ----- Supabase -----
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { realtime: { params: { eventsPerSecond: 5 }}});

// ----- Helpers -----
function fmtTime(d){ return d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
function escapeHtml(s=''){return s.replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}

function parseFormat(fmt){
  const f = (fmt || 'best_of_3').toLowerCase();
  const isGP = f.endsWith('_gp');
  const isProset = f.startsWith('proset');
  const isSuper = f.startsWith('super_tiebreak');
  const gamesToWinSet = isProset ? 9 : 6;
  const setsToWinMatch = isProset ? 1 : 2;
  return { f, isGP, isProset, isSuper, gamesToWinSet, setsToWinMatch };
}

function isSetConcluded(s, cfg, index){
  if (!s) return false;
  const t1 = Number.isFinite(s.team1) ? s.team1 : 0;
  const t2 = Number.isFinite(s.team2) ? s.team2 : 0;
  const maxV = Math.max(t1, t2), minV = Math.min(t1, t2), diff = Math.abs(t1 - t2);

  if (cfg.isSuper && index === 2) return (maxV >= 10) && (diff >= 2);
  if (cfg.isProset) return (maxV >= 9) && (diff >= 2);
  if (maxV === 7 && (minV === 5 || minV === 6)) return true;
  return (maxV >= cfg.gamesToWinSet) && (diff >= 2);
}

function countWonSets(sets, cfg){
  let w1=0, w2=0;
  for (let i=0;i<Math.min(sets.length,3);i++){
    if (isSetConcluded(sets[i], cfg, i)){
      const {team1=0, team2=0} = sets[i] || {};
      if (team1>team2) w1++; else if (team2>team1) w2++;
    }
  }
  return [w1,w2];
}

function tennisPoint(n, gp){
  const map = [0,15,30,40,'AD'];
  if (!Number.isFinite(n) || n<0) return '—';
  return gp ? map[Math.min(n,3)] : map[Math.min(n,4)];
}

function isNormalTBActive(current, cfg){
  if (cfg.isProset) return false;
  const g1 = Number(current?.games_team1||0);
  const g2 = Number(current?.games_team2||0);
  return g1===cfg.gamesToWinSet && g2===cfg.gamesToWinSet; // 6–6
}

function superTBActive(sets, cfg, matchOver){
  if (!cfg.isSuper) return false;
  const [w1,w2] = countWonSets(sets, cfg);
  if (matchOver) return false;
  return (w1===1 && w2===1);
}

// ----- Render -----
function render(games){
  grid.innerHTML = '';
  const n = games.length;

  if (!n){
    grid.style.gridTemplateColumns = 'repeat(1, 1fr)';
    grid.style.gridTemplateRows = 'repeat(1, 1fr)';
    const ph = document.createElement('div');
    ph.className = 'tile placeholder';
    ph.innerHTML = 'Sem jogos para mostrar. Usa <code>?ids=...</code>';
    grid.appendChild(ph);
    return;
  }

  // 1->1x1, 2->1x2, 3/4->2x2 (sem scroll)
  let cols=1, rows=1;
  if (n===1){ cols=1; rows=1; }
  else if (n===2){ cols=2; rows=1; }
  else { cols=2; rows=2; }
  grid.style.gridTemplateColumns = `repeat(${cols},1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows},1fr)`;

  games.forEach(g => grid.appendChild(tile(g)));

  const target = cols*rows;
  for (let i=games.length; i<target; i++){
    const ph = document.createElement('div');
    ph.className = 'tile placeholder';
    grid.appendChild(ph);
  }
}

function tile(game){
  const cfg = parseFormat(game.format);
  const s = game.score || {};
  const sets = Array.isArray(s.sets) ? s.sets.slice(0,3) : [];
  const cur = s.current || {};
  const [w1,w2] = countWonSets(sets, cfg);
  const matchOver = (w1>=cfg.setsToWinMatch) || (w2>=cfg.setsToWinMatch);
  const normalTB = isNormalTBActive(cur, cfg);
  const superTB = superTBActive(sets, cfg, matchOver);

  const pair1 = `${escapeHtml(game.player1)} & ${escapeHtml(game.player2)}`;
  const pair2 = `${escapeHtml(game.player3)} & ${escapeHtml(game.player4)}`;

  const g1 = Number(cur.games_team1||0);
  const g2 = Number(cur.games_team2||0);
  const tb1 = Number(cur.tb_team1||0);
  const tb2 = Number(cur.tb_team2||0);
  const p1 = Number(cur.points_team1||0);
  const p2 = Number(cur.points_team2||0);

  let mainLine = '';
  let subLine  = '';
  if (superTB){
    mainLine = `Super TB ${tb1}–${tb2}`;
    subLine  = `Jogos ${g1}–${g2}`;
  } else if (normalTB){
    mainLine = `TB ${tb1}–${tb2}`;
    subLine  = `Jogos ${g1}–${g2}`;
  } else {
    mainLine = `${tennisPoint(p1, cfg.isGP)}–${tennisPoint(p2, cfg.isGP)}`;
    subLine  = `Jogos ${g1}–${g2}`;
  }

  const maxSets = cfg.setsToWinMatch*2 - 1; // 1..3
  const boxes = [];
  for (let i=0;i<Math.min(sets.length, maxSets);i++){
    const set = sets[i] || {};
    const concluded = isSetConcluded(set, cfg, i);

    let showCurrent = false;
    let label = '';
    let top = 0, bot = 0;

    if (concluded){
      top = Number(set.team1||0);
      bot = Number(set.team2||0);
    } else {
      const currentIndex = (()=>{ let c=0; for (let k=0;k<Math.min(sets.length, maxSets);k++){ if (isSetConcluded(sets[k], cfg, k)) c++; } return c; })();
      if (i === currentIndex){
        if (superTB){
          const anyTB = (tb1+tb2)>0;
          if (anyTB){ top=tb1; bot=tb2; label='Super TB'; showCurrent=true; }
        } else if (normalTB){
          const anyTB = (tb1+tb2)>0;
          if (anyTB){ top=tb1; bot=tb2; label='TB'; showCurrent=true; }
        } else {
          const anyGames = (g1+g2)>0;
          if (anyGames){ top=g1; bot=g2; showCurrent=true; }
        }
      }
    }

    if (concluded || showCurrent){
      boxes.push(
        `<div class="set ${showCurrent ? 'current' : ''}">
           <strong>${top}</strong>
           <small>${bot}</small>
           ${label ? '<small>'+label+'</small>' : ''}
         </div>`
      );
    }
  }

  const wrap = document.createElement('div');
  wrap.className = 'tile';

  const courtName = game.court_name
    ? `Campo ${escapeHtml(game.court_name)}`
    : (game.court_id ? `Campo ${escapeHtml(String(game.court_id)).slice(0, 8)}` : '');

  wrap.innerHTML = `
    <div class="row">
      <div>
        <span class="badge">${escapeHtml(game.format || 'best_of_3')}</span>
        ${courtName ? `<span class="muted" style="margin-left:8px">• ${courtName}</span>` : ''}
      </div>
      <div>${matchOver ? 'Final' :
        ((superTB || normalTB || (g1+g2+p1+p2+tb1+tb2) > 0) ? '<span class="pulse">AO VIVO</span>' : 'Pré-jogo')}</div>
    </div>

    <div class="teams" style="margin-top:8px">
      <div class="pair right"><div class="names">${pair1}</div></div>
      <div class="scoreBox">
        <div class="games">${mainLine}</div>
        <div class="points">${subLine}</div>
        <div class="sets">${boxes.join('')}</div>
      </div>
      <div class="pair"><div class="names">${pair2}</div></div>
    </div>
  `;
  return wrap;
}

// ----- Data -----
const TABLE = 'games';
const SELECT_COLUMNS = 'id,player1,player2,player3,player4,format,score,court_id,created_at';

async function fetchGames(){
  if (!ids.length) return [];

  // 1) jogos
  const { data, error } = await supabase
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .in('id', ids)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const games = data || [];

  // 2) courts (nome)
  const courtIds = [...new Set(games.map(g=>g.court_id).filter(Boolean))];
  if (courtIds.length){
    const { data: courts, error: courtErr } = await supabase
      .from('courts')
      .select('id,name')
      .in('id', courtIds);
    if (!courtErr && Array.isArray(courts)){
      const map = new Map(courts.map(c => [c.id, c.name]));
      for (const g of games){
        if (g.court_id && map.has(g.court_id)) g.court_name = map.get(g.court_id);
      }
    } else {
      console.warn('Courts read blocked by RLS or missing', courtErr);
    }
  }
  return games;
}

// ----- Bootstrap -----
let current = [];
try {
  current = await fetchGames();
  render(current);
  touch('Ligado', true);
} catch (e) {
  console.error('Supabase error:', e);
  touch('Erro de leitura', false);
}

// ----- Realtime -----
if (ids.length){
  const filter = `id=in.(${ids.join(',')})`;
  const channel = supabase.channel('games-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE, filter }, (payload) => {
      const row = payload.new;
      const idx = current.findIndex(g => g.id === row.id);
      if (idx >= 0) current[idx] = { ...current[idx], ...row };
      else current.push(row);
      render(current);
      touch('Atualizado', true);
    })
    .subscribe((status) => {
      touch(status === 'SUBSCRIBED' ? 'Ligado' : 'Offline', status === 'SUBSCRIBED');
    });

  // polling de segurança
  setInterval(async () => {
    try {
      const fresh = await fetchGames();
      if (JSON.stringify(fresh) !== JSON.stringify(current)){
        current = fresh;
        render(current);
        touch('Sincronizado', true);
      }
    } catch { /* silêncio */ }
  }, 15000);

  window.addEventListener('beforeunload', () => supabase.removeChannel(channel));
}

// ----- Status -----
function touch(text, ok){
  if (!statusEl) return;
  statusEl.innerHTML = `<span class="${ok?'status-ok':'status-bad'}">●</span> ${text} • ${fmtTime(new Date())}`;
}

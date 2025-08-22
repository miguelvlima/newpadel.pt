{{-- resources/views/scoreboard.blade.php --}}
@php
  $supabase = [
    'url'  => config('services.supabase.url'),
    'anon' => config('services.supabase.anon'),
  ];
@endphp
<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Scoreboard – Padel (ao vivo)</title>
  <style>
    :root { --bg:#000; --fg:#fff; --muted:#b8b8b8; --glass:rgba(255,255,255,.08); }
    *{box-sizing:border-box}
    html,body{height:100%}
    body{margin:0;background:var(--bg);color:var(--fg);font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif}
    header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
    .brand{display:flex;align-items:center;gap:10px}
    .muted{color:var(--muted)}
    button{background:rgba(255,255,255,.1);color:#fff;border:0;border-radius:14px;padding:8px 12px;cursor:pointer}
    button:hover{background:rgba(255,255,255,.2)}
    main{padding:16px;display:grid;gap:16px;grid-template-columns:repeat(1,minmax(0,1fr))}
    @media(min-width:900px){ main{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
    .tile{aspect-ratio:16/9;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.05));padding:14px;display:flex;flex-direction:column}
    .row{display:flex;align-items:center;justify-content:space-between}
    .badge{font-size:12px;letter-spacing:.12em;text-transform:uppercase;background:rgba(255,255,255,.1);padding:4px 8px;border-radius:6px}
    .teams{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:8px}
    .pair{display:flex;align-items:center;gap:10px;max-width:45%}
    .pair.right{justify-content:flex-end;text-align:right}
    .pair .names{font-weight:700;font-size:clamp(14px,2.2vw,22px);line-height:1.15}
    .scoreBox{display:flex;flex-direction:column;align-items:center;min-width:40%}
    .games{font-weight:900;font-size:min(8.5vw,72px);line-height:1}
    .points{margin-top:4px;color:#eaeaea}
    .sets{margin-top:10px;display:flex;gap:6px;justify-content:center}
    .set{min-width:34px;padding:6px 8px;border-radius:10px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);text-align:center}
    .set strong{font-size:16px}
    .set small{display:block;color:#ddd;font-size:11px}
    .set.current{outline:2px solid #fff;}
    .status-ok{color:#5ee87b}
    .status-bad{color:#ff8a8a}
    .placeholder{display:grid;place-items:center;color:#aaa;font-size:18px}
    .pulse{animation:pulse 1s infinite}
    @keyframes pulse{0%{opacity:1}50%{opacity:.4}100%{opacity:1}}
    .hide-cursor *{cursor:none !important}
  </style>
</head>
<body>
  <header>
    <div class="brand"><span>🎾</span><strong>Scoreboard Padel</strong><span class="muted">ao vivo (Supabase)</span></div>
    <div class="muted" id="status">—</div>
    <div><button id="fs">Ecrã inteiro</button></div>
  </header>
  <main id="grid">
    <div class="tile placeholder">Seleciona jogos com <code>?ids=&lt;uuid1&gt;,&lt;uuid2&gt;</code> (máx 4) • <code>&kiosk=1</code> para TV</div>
  </main>

    <script type="module">
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

    const SB = @json($supabase);
    const SUPABASE_URL  = SB.url;
    const SUPABASE_ANON = SB.anon;

    const TABLE = 'games';

    // JOIN courts (FK games.court_id -> courts.id) to get court name
    // Use relationship alias via the FK name for reliability
    const SELECT = [
      'id','player1','player2','player3','player4',
      'format','score','court_id','created_at',
      'court:courts!games_court_id_fkey(name)'
    ].join(',');

    const params = new URLSearchParams(location.search);
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const ids = (params.get('ids')||'')
      .split(',')
      .map(s=>s.trim())
      .filter(x=>uuidRe.test(x))
      .slice(0,4);
    const kiosk = params.get('kiosk') === '1';
    if (kiosk) document.body.classList.add('hide-cursor');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { realtime: { params: { eventsPerSecond: 5 }}});

    const grid = document.getElementById('grid');
    const statusEl = document.getElementById('status');

    document.getElementById('fs').addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    });

    function fmtTime(d){ return d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
    function escapeHtml(s=''){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));}

    // ---------- Rules derived from format ----------
    function parseFormat(fmt){
      const f = (fmt||'best_of_3').toLowerCase();
      const isGP = f.endsWith('_gp');
      const isProset = f.startsWith('proset');
      const isSuper = f.startsWith('super_tiebreak');
      const gamesToWinSet = isProset ? 9 : 6;   // typical
      const setsToWinMatch = isProset ? 1 : 2;  // proset is single set
      return {f,isGP,isProset,isSuper,gamesToWinSet,setsToWinMatch};
    }
    function countWonSets(sets, cfg){
      let w1=0, w2=0;
      for (let i=0;i<sets.length;i++){
        if (isSetConcluded(sets[i], cfg, i)){
          const {team1=0, team2=0} = sets[i]||{};
          if (team1>team2) w1++; else if (team2>team1) w2++;
        }
      }
      return [w1,w2];
    }
    function isSetConcluded(s, cfg, index){
      if (!s) return false;
      const t1 = Number.isFinite(s.team1)? s.team1 : 0;
      const t2 = Number.isFinite(s.team2)? s.team2 : 0;
      const maxV = Math.max(t1,t2), minV = Math.min(t1,t2), diff = Math.abs(t1-t2);
      if (cfg.isSuper && index === (cfg.setsToWinMatch*2-1)-1){ // 3rd slot on BO3-super
        // super TB valid: >=10 and diff>=2
        return (maxV >= 10) && (diff >= 2);
      }
      if (cfg.isProset){
        return (maxV >= cfg.gamesToWinSet) && (diff >= 2);
      }
      // Normal BO3: 6-x by 2 or 7-5/7-6 (TB)
      if (maxV === 7 && (minV === 5 || minV === 6)) return true;
      return (maxV >= cfg.gamesToWinSet) && (diff >= 2);
    }

    function tennisPoint(n, gp){
      const map = [0,15,30,40,'AD'];
      if (!Number.isFinite(n) || n<0) return '—';
      if (gp) return map[Math.min(n,3)];
      return map[Math.min(n,4)];
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
      return (w1===1 && w2===1); // 1–1, 3º set é super TB
    }

    function render(games){
      grid.innerHTML = '';
      if (!games.length){
        const ph = document.createElement('div');
        ph.className = 'tile placeholder';
        ph.innerHTML = 'Sem jogos para mostrar. Usa <code>?ids=...</code>';
        grid.appendChild(ph);
        return;
      }
      games.forEach(g => grid.appendChild(tile(g)));
      for (let i=games.length; i<Math.min(4,ids.length||4); i++){
        const ph = document.createElement('div');
        ph.className = 'tile placeholder';
        grid.appendChild(ph);
      }
    }

    function tile(game){
      const cfg = parseFormat(game.format);
      const s = game.score || {};
      const sets = Array.isArray(s.sets) ? s.sets : [];
      const cur = s.current || {};
      const [w1,w2] = countWonSets(sets, cfg);
      const matchOver = (w1 >= cfg.setsToWinMatch) || (w2 >= cfg.setsToWinMatch);
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

      // Decide what to show as the MAIN line (foreground current)
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

      // Build SETS row: only show concluded or ongoing
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
          // Ongoing current set?
          const currentIndex = (()=>{
            let c=0; for (let k=0;k<Math.min(sets.length, maxSets);k++){ if (isSetConcluded(sets[k], cfg, k)) c++; }
            return c;
          })();
          if (i === currentIndex){
            if (superTB){
              const anyTB = (tb1+tb2)>0;
              if (anyTB){ top = tb1; bot = tb2; label='Super TB'; showCurrent=true; }
            } else if (normalTB){
              const anyTB = (tb1+tb2)>0;
              if (anyTB){ top = tb1; bot = tb2; label='TB'; showCurrent=true; }
            } else {
              const anyGames = (g1+g2)>0;
              if (anyGames){ top = g1; bot = g2; showCurrent=true; }
            }
          }
        }

        if (concluded || showCurrent){
          boxes.push(`
            <div class="set ${showCurrent?'current':''}">
              <strong>${top}</strong>
              <small>${bot}</small>
              ${label? `<small>${label}</small>`:''}
            </div>
          `);
        }
      }

      const wrap = document.createElement('div');
      wrap.className = 'tile';
      const courtName = game.court?.name ? `Campo ${escapeHtml(game.court.name)}` : (game.court_id ? `Campo ${escapeHtml(String(game.court_id)).slice(0,8)}` : '');

      wrap.innerHTML = `
        <div class="row">
          <div>
            <span class="badge">${escapeHtml(game.format || 'best_of_3')}</span>
            ${courtName ? `<span class="muted" style="margin-left:8px">• ${courtName}</span>`:''}
          </div>
          <div>${matchOver? 'Final' : (superTB || normalTB ? '<span class="pulse">AO VIVO</span>' : ( (g1+g2+p1+p2+tb1+tb2)>0 ? '<span class="pulse">AO VIVO</span>' : 'Pré-jogo'))}</div>
        </div>

        <div class="teams" style="margin-top:8px">
          <div class="pair righ
</body>
</html>

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

    // ===== Injeção de config Laravel =====
    const SB = @json($supabase);
    const SUPABASE_URL  = SB.url;
    const SUPABASE_ANON = SB.anon;

    // Fonte de dados
    const TABLE = 'games';

    // Campos que vamos selecionar da tabela public.games
    const SELECT = [
      'id','player1','player2','player3','player4','format','score','court_id','created_at'
    ].join(',');

    // Lê IDs da query (?ids=uuid,uuid,...) e valida UUID v4
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

    function tennisPoint(n){
      // n é inteiro (0..). Map para ténis: 0,15,30,40,AD (>=5 volta a mostrar n p/ casos atípicos)
      const map = [0,15,30,40,'AD'];
      return (Number.isFinite(n) && n >= 0 && n < map.length) ? map[n] : (Number.isFinite(n) ? n : '—');
    }

    function deriveStatus(score){
      try{
        if (!score) return 'pre';
        const s = score;
        const anySet = Array.isArray(s.sets) && s.sets.some(set=> (set.team1||0) + (set.team2||0) > 0);
        const anyCurrent = s.current && (
          (s.current.games_team1||0) + (s.current.games_team2||0) +
          (s.current.points_team1||0) + (s.current.points_team2||0) +
          (s.current.tb_team1||0) + (s.current.tb_team2||0)
        ) > 0;
        return (anySet || anyCurrent) ? 'live' : 'pre';
      }catch{ return 'pre'; }
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
      const s = game.score || {};
      const status = deriveStatus(s);
      const isLive = status === 'live';
      const pair1 = `${escapeHtml(game.player1)} & ${escapeHtml(game.player2)}`;
      const pair2 = `${escapeHtml(game.player3)} & ${escapeHtml(game.player4)}`;

      const wrap = document.createElement('div');
      wrap.className = 'tile';

      // Sets
      const sets = Array.isArray(s.sets) ? s.sets : [];
      const current = s.current || {};
      const setHtml = sets.map((set, idx) => {
        const isCurrent = (idx === sets.findIndex(x => (x.team1||0)===0 && (x.team2||0)===0));
        return `<div class="set ${isCurrent?'current':''}">
                  <strong>${Number.isFinite(set.team1)? set.team1 : 0}</strong>
                  <small>${Number.isFinite(set.team2)? set.team2 : 0}</small>
                </div>`;
      }).join('');

      // Games + points atuais (do set em curso)
      const games1 = Number.isFinite(current.games_team1) ? current.games_team1 : 0;
      const games2 = Number.isFinite(current.games_team2) ? current.games_team2 : 0;
      const tb1 = Number.isFinite(current.tb_team1) ? current.tb_team1 : 0;
      const tb2 = Number.isFinite(current.tb_team2) ? current.tb_team2 : 0;
      const p1 = Number.isFinite(current.points_team1) ? current.points_team1 : 0;
      const p2 = Number.isFinite(current.points_team2) ? current.points_team2 : 0;

      const pointsStr = (tb1>0 || tb2>0)
        ? `TB ${tb1}–${tb2}`
        : `${tennisPoint(p1)}–${tennisPoint(p2)}`;

      wrap.innerHTML = `
        <div class="row">
          <div>
            <span class="badge">${escapeHtml(game.format || 'best_of_3')}</span>
            ${game.court_id ? `<span class="muted" style="margin-left:8px">• Court ${escapeHtml(String(game.court_id)).slice(0,8)}</span>`:''}
          </div>
          <div>${isLive?'<span class="pulse">AO VIVO</span>':'Pré-jogo'}</div>
        </div>

        <div class="teams">
          <div class="pair right"><div class="names">${pair1}</div></div>
          <div class="scoreBox">
            <div class="games">${games1}\u00A0<span class="muted">–</span>\u00A0${games2}</div>
            <div class="points">${pointsStr}</div>
            <div class="sets">${setHtml || ''}</div>
          </div>
          <div class="pair"><div class="names">${pair2}</div></div>
        </div>
      `;

      return wrap;
    }

    function escapeHtml(s=''){return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));}

    async function fetchGames(){
      if (!ids.length) return [];
      const { data, error } = await supabase
        .from(TABLE)
        .select(SELECT)
        .in('id', ids)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // score é JSON; supabase-js já decodifica para objeto
      return data || [];
    }

    // bootstrap
    let current = [];
    try { current = await fetchGames(); render(current); touch('Ligado', true); }
    catch(e){ console.error(e); touch('Erro de leitura', false); }

    // realtime por UUIDs
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

      // polling de segurança (15s)
      setInterval(async () => {
        try {
          const fresh = await fetchGames();
          if (JSON.stringify(fresh) !== JSON.stringify(current)){
            current = fresh; render(current); touch('Sincronizado', true);
          }
        } catch {}
      }, 15000);

      window.addEventListener('beforeunload', () => supabase.removeChannel(channel));
    }

    function touch(text, ok){
      statusEl.innerHTML = `<span class="${ok?'status-ok':'status-bad'}">●</span> ${text} • ${fmtTime(new Date())}`;
    }
  </script>
</body>
</html>

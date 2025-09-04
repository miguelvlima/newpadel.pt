// /public/js/scoreboard/supabase-api.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function initSupabase(url, anon){
  if (!/^https:\/\/.+\.supabase\.co/i.test(url)) throw new Error('SUPABASE_URL inválida');
  return createClient(url, anon, { realtime: { params: { eventsPerSecond: 5 } } });
}

export async function fetchScreen(sb, key, brand) {
  const { data, error } = await sb
    .from('scoreboards')
    .select('id, key, title, layout, kiosk, positions, logo_url')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;

  const screen = data || { key, title: key };
  const { logoEl, titleEl } = brand || {};

  const title = screen.title || key || 'Scoreboard';
  document.title = title;

  // Kiosk
  if (screen.kiosk) document.body.classList.add('hide-cursor');
  else document.body.classList.remove('hide-cursor');

  // Branding robusto: título visível por defeito; logo só após onload
  if (logoEl && titleEl) {
    // limpar handlers antigos
    logoEl.onload = null;
    logoEl.onerror = null;

    // estado inicial (fallback = título)
    titleEl.textContent = title;
    titleEl.style.display = '';
    logoEl.style.display = 'none';

    if (screen.logo_url) {
      // requestId para ignorar callbacks “antigos”
      const reqId = (fetchScreen._rid = (fetchScreen._rid || 0) + 1);

      logoEl.onload = () => {
        if (reqId !== fetchScreen._rid) return;
        logoEl.style.display = 'inline-block';
        titleEl.style.display = 'none';
      };
      logoEl.onerror = () => {
        if (reqId !== fetchScreen._rid) return;
        logoEl.style.display = 'none';
        titleEl.style.display = '';
      };

      // definir src no fim, já com handlers activos
      logoEl.alt = title;
      logoEl.decoding = 'async';
      logoEl.loading = 'eager';
      logoEl.src = screen.logo_url; // tem de ser https e público
    }
  } else if (titleEl) {
    // sem logoEl → fica título
    titleEl.textContent = title;
    titleEl.style.display = '';
  }

  return screen;
}


export async function fetchSlots(sb, screen){
  const { data: rows, error } = await sb.from('scoreboard_selections')
    .select('position, game_id')
    .eq('scoreboard_id', screen.id)
    .order('position', { ascending: true });
  if (error) throw error;
  const rawPositions = Number(screen?.positions) || rows.length || 1;
  const positions = Math.max(1, Math.min(4, rawPositions));
  const ids = rows.map(r => r.game_id).filter(Boolean);

  const games = await fetchGames(sb, ids);
  const gmap = new Map(games.map(g=>[g.id,g]));
  const slots = Array.from({length: positions}, (_, i) => {
    const row = rows.find(r => Number(r.position) === i+1);
    if (row && row.game_id && gmap.has(row.game_id)) return gmap.get(row.game_id);
    return null;
  });
  return { slots, positions };
}

export async function fetchGames(sb, ids){
  if (!ids.length) return [];
  const { data, error } = await sb.from('games')
    .select('id,player1,player2,player3,player4,format,score,court_id,created_at')
    .in('id', ids);
  if (error) throw error;
  const games = data || [];
  const courtIds = [...new Set(games.map(g=>g.court_id).filter(Boolean))];
  if (courtIds.length){
    const { data: courts } = await sb.from('courts').select('id,name').in('id', courtIds);
    const map = new Map((courts||[]).map(c=>[c.id,c.name]));
    for (const g of games){ if (g.court_id && map.has(g.court_id)) g.court_name = map.get(g.court_id); }
  }
  return games;
}

/* Realtime */
export function subscribeSelections(sb, screenId, onChange){
  return sb.channel('selections-live')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scoreboard_selections', filter: `scoreboard_id=eq.${screenId}` }, onChange)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'scoreboard_selections', filter: `scoreboard_id=eq.${screenId}` }, onChange)
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'scoreboard_selections' }, (payload) => {
      if (payload?.old?.scoreboard_id && payload.old.scoreboard_id !== screenId) return;
      onChange();
    })
    .subscribe();
}

export function subscribeGames(sb, getSlots, onGameChange){
  return sb.channel('games-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, (payload) => {
      const row = payload.new;
      const slots = getSlots();
      const idx = slots.findIndex(g => g && g.id === row.id);
      if (idx >= 0) onGameChange(idx, row);
    })
    .subscribe();
}

export function subscribeScreenMeta(sb, screenId, onMeta){
  return sb.channel('screen-meta-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'scoreboards', filter: `id=eq.${screenId}` }, (payload) => {
      const row = payload.new ?? payload.old ?? {};
      onMeta(row);
    })
    .subscribe();
}

@extends('layouts.app')

@section('title', 'Ementa - New Padel')

@section('content')
@php
    $sbUrl = config('services.supabase.url');
    $sbAnon = config('services.supabase.anon_key')
        ?? config('services.supabase.anon')
        ?? config('services.supabase.key');
@endphp

<div class="wrap">
    <section class="section">
        <div class="section-head">
            <h2>Ementa</h2>
            <p class="hint">Pratos e snacks disponíveis na cafetaria New Padel</p>
        </div>

        <div id="menuGrid" class="menu-list"></div>
    </section>
</div>

<style>
#menuGrid.menu-list {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 18px !important;
}

#menuGrid .menu-item {
    display: grid !important;
    grid-template-columns: 145px minmax(0, 1fr) !important;
    gap: 16px !important;
    align-items: center !important;
    padding: 12px !important;
    border-radius: 18px !important;
    background: rgba(255,255,255,.06) !important;
    border: 1px solid rgba(255,255,255,.12) !important;
    overflow: hidden !important;
}

#menuGrid .menu-item > img {
    width: 145px !important;
    height: 105px !important;
    max-width: 145px !important;
    object-fit: contain !important;
    object-position: center !important;
    background: #111 !important;
    border-radius: 14px !important;
    padding: 4px !important;
}

#menuGrid .menu-content {
    min-width: 0 !important;
}

#menuGrid .menu-title-row {
    display: flex !important;
    justify-content: space-between !important;
    gap: 12px !important;
}

#menuGrid .menu-title-row h3 {
    margin: 0 !important;
    color: #fff !important;
    font-size: 1rem !important;
    line-height: 1.2 !important;
}

#menuGrid .menu-title-row strong {
    color: #fff !important;
    white-space: nowrap !important;
}

#menuGrid .menu-content p {
    margin: 6px 0 0 !important;
    color: rgba(255,255,255,.7) !important;
    font-size: .82rem !important;
    line-height: 1.35 !important;
}

@media (max-width: 1100px) {
    #menuGrid.menu-list {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    }
}

@media (max-width: 700px) {
    #menuGrid.menu-list {
        grid-template-columns: 1fr !important;
    }
}
</style>

<script>
    const SUPABASE_URL = @json($sbUrl);
    const SUPABASE_ANON = @json($sbAnon);

    async function loadMenu() {
        const grid = document.getElementById('menuGrid');

        if (!SUPABASE_URL || !SUPABASE_ANON) {
            grid.innerHTML = `<p class="hint">Supabase não configurado.</p>`;
            console.error('SUPABASE_URL ou SUPABASE_ANON em falta', {
                SUPABASE_URL,
                hasAnon: Boolean(SUPABASE_ANON)
            });
            return;
        }

        const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/menu_items`;

        const params = new URLSearchParams({
            select: 'name,description,price,image_url,image_alt',
            active: 'eq.true',
            order: 'sort_order.asc'
        });

        const res = await fetch(`${endpoint}?${params.toString()}`, {
            headers: {
                apikey: SUPABASE_ANON,
                Authorization: `Bearer ${SUPABASE_ANON}`,
                Accept: 'application/json'
            }
        });

        if (!res.ok) {
            const error = await res.text();
            grid.innerHTML = `<p class="hint">Não foi possível carregar a ementa.</p>`;
            console.error('Erro Supabase:', res.status, error);
            return;
        }

        const items = await res.json();

        if (!items.length) {
            grid.innerHTML = `<p class="hint">A ementa ainda não está disponível.</p>`;
            return;
        }

        grid.innerHTML = items.map(item => `
            <article class="menu-item">
                <img
                    src="${item.image_url || '/images/menu-placeholder.jpg'}"
                    alt="${item.image_alt || item.name}"
                    loading="lazy"
                >

                <div class="menu-content">
                    <div class="menu-title-row">
                        <h3>${item.name}</h3>
                        <strong>${Number(item.price).toLocaleString('pt-PT', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} €</strong>
                    </div>

                    ${item.description ? `<p>${item.description}</p>` : ''}
                </div>
            </article>
        `).join('');
    }

    loadMenu();
</script>
@endsection
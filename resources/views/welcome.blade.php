@extends('layouts.app')

@section('title', 'New Padel')

@section('content')
@php
  $circuitoUrl = 'https://www.circuitosocialregionaldepadel.pt/';
@endphp

<div class="np-shell" id="top">

  <nav class="desk-nav" aria-label="Navegação">
    <a href="#socio">Sócio</a>
    <a href="#academia">Academia</a>
    <a href="#reservas">Reservas</a>
    <a href="#patrocinadores">Parceiros</a>
    <a href="#eventos">Eventos</a>
    <a href="#contactos">Contactos</a>
    <a class="desk-nav__ext" href="{{ $circuitoUrl }}" target="_blank" rel="noopener">Circuito</a>
  </nav>

  {{-- STAGE: vídeo primeiro (mobile = ecrã inteiro) --}}
  <section class="stage" aria-label="Apresentação">
    <video
      class="stage-video"
      src="/media/intro-story.mp4"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/media/intro-poster.jpg"
    ></video>
    <div class="stage-veil" aria-hidden="true"></div>

    <div class="stage-ui">
      <div class="stage-top">
        <a class="stage-pill" href="https://wa.me/351910715689" target="_blank" rel="noopener" aria-label="WhatsApp">
          <svg class="stage-pill__wa" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.3-1.65a11.9 11.9 0 0 0 5.76 1.47h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.17-3.44-8.44ZM12.07 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.9 9.89Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"/>
          </svg>
          WhatsApp
        </a>
      </div>

      <div class="stage-bottom">
        <img class="stage-logo" src="/images/NEW_PADEL_LOGO_2026.png?v=6" alt="New Padel" width="200" height="200" />
        <h1 class="stage-title">New Padel</h1>
        <p class="stage-kicker">Chão da Fonte · Viseu</p>
        <p class="stage-lead">Quatro campos cobertos. Academia. Convívio.</p>
        <a class="stage-cta" href="#socio">Entrar no clube</a>
      </div>
    </div>
  </section>

  <main class="np-main">

    <section class="strip" aria-label="Comodidades">
      <div class="strip-track">
        <span>4 campos cobertos</span>
        <span>Estacionamento</span>
        <span>Carregadores EV</span>
        <span>Cafetaria</span>
        <span>Loja</span>
        <span>Esplanada 150 m²</span>
        <span>Parque infantil</span>
        <span>Balneários</span>
        <span aria-hidden="true">4 campos cobertos</span>
        <span aria-hidden="true">Estacionamento</span>
        <span aria-hidden="true">Carregadores EV</span>
        <span aria-hidden="true">Cafetaria</span>
        <span aria-hidden="true">Loja</span>
        <span aria-hidden="true">Esplanada 150 m²</span>
        <span aria-hidden="true">Parque infantil</span>
        <span aria-hidden="true">Balneários</span>
      </div>
    </section>

    <section id="socio" class="panel">
      <header class="panel-head">
        <p class="panel-eye">01</p>
        <h2>Sócio</h2>
        <p class="panel-sub">Modalidades e vantagens</p>
      </header>

      <div class="tier-stack">
        <article class="tier">
          <div class="tier-meta">
            <h3>BLACK</h3>
            <p class="tier-price"><em>60 €</em><span>/ ano</span></p>
          </div>
          <ul>
            <li>Desconto de <b>1 €</b> em cada reserva de campo.</li>
            <li>Desconto de <b>5%</b> na inscrição em aulas.</li>
            <li>Desconto na inscrição em torneios realizados no clube.</li>
            <li>Oferta (pessoal e intransmissível) de um jogo de <b>1h30</b> no dia de aniversário.</li>
          </ul>
        </article>

        <article class="tier tier--hot">
          <div class="tier-meta">
            <h3>WHITE</h3>
            <p class="tier-price"><em>1000 €</em><span>/ ano</span></p>
            <p class="tier-alt">ou <b>100 € / mês</b> · fidelização 1 ano</p>
          </div>
          <ul>
            <li>Livre-trânsito para marcação e realização de jogos (mediante disponibilidade dos campos).</li>
            <li>Desconto de <b>5%</b> na inscrição em aulas.</li>
            <li>Desconto na inscrição em torneios realizados no clube.</li>
            <li>Oferta de um campo por <b>1h30</b> no dia de aniversário.</li>
          </ul>
        </article>
      </div>

      <p class="panel-note">Contacta o <b>910 715 689</b>. Valores com IVA.</p>
    </section>

    <section id="academia" class="panel">
      <header class="panel-head">
        <p class="panel-eye">02</p>
        <h2>Academia</h2>
        <p class="panel-sub">Mensalidades e packs</p>
      </header>

      <div class="price-board">
        <article class="price-card">
          <h3>Matrícula mensal — Adultos</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>1× sem</th><th>2× sem</th></tr></thead>
              <tbody>
                <tr><th>Light Sócio</th><td>48 €</td><td>82 €</td></tr>
                <tr><th>Light Não Sócio</th><td>52 €</td><td>86 €</td></tr>
                <tr><th>Prime Sócio</th><td>60 €</td><td>104 €</td></tr>
                <tr><th>Prime Não Sócio</th><td>63 €</td><td>109 €</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="price-card">
          <h3>Matrícula mensal — Crianças</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>1× sem</th><th>2× sem</th></tr></thead>
              <tbody>
                <tr><th>Light Sócio</th><td>38 €</td><td>60 €</td></tr>
                <tr><th>Light Não Sócio</th><td>40 €</td><td>63 €</td></tr>
                <tr><th>Prime Sócio</th><td>48 €</td><td>70 €</td></tr>
                <tr><th>Prime Não Sócio</th><td>52 €</td><td>75 €</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="price-card">
          <h3>Pack aulas — 1 adulto</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>1</th><th>4</th><th>10</th></tr></thead>
              <tbody>
                <tr><th>Light Sócio</th><td>41 €</td><td>151 €</td><td>314 €</td></tr>
                <tr><th>Light Não Sócio</th><td>44 €</td><td>159 €</td><td>331 €</td></tr>
                <tr><th>Prime Sócio</th><td>46 €</td><td>173 €</td><td>352 €</td></tr>
                <tr><th>Prime Não Sócio</th><td>49 €</td><td>182 €</td><td>371 €</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="price-card">
          <h3>Pack aulas — 2 adultos</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>1</th><th>4</th><th>10</th></tr></thead>
              <tbody>
                <tr><th>Light Sócio</th><td>24 €</td><td>79 €</td><td>177 €</td></tr>
                <tr><th>Light Não Sócio</th><td>26 €</td><td>84 €</td><td>190 €</td></tr>
                <tr><th>Prime Sócio</th><td>30 €</td><td>107 €</td><td>199 €</td></tr>
                <tr><th>Prime Não Sócio</th><td>32 €</td><td>113 €</td><td>210 €</td></tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="price-card price-card--wide">
          <h3>Pack aulas — 1 criança</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>1</th><th>4</th><th>10</th></tr></thead>
              <tbody>
                <tr><th>Light Sócio</th><td>37 €</td><td>139 €</td><td>298 €</td></tr>
                <tr><th>Light Não Sócio</th><td>40 €</td><td>147 €</td><td>314 €</td></tr>
                <tr><th>Prime Sócio</th><td>43 €</td><td>155 €</td><td>330 €</td></tr>
                <tr><th>Prime Não Sócio</th><td>45 €</td><td>164 €</td><td>348 €</td></tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <div class="panel-note">
        <div><b>LIGHT</b> — Seg–sex, 9h–17h.</div>
        <div><b>PRIME</b> — Seg–sex 17h–24h · fins-de-semana e feriados 9h–24h.</div>
        <div>Por pessoa · com IVA.</div>
      </div>
    </section>

    <section id="reservas" class="panel">
      <header class="panel-head">
        <p class="panel-eye">03</p>
        <h2>Reservas</h2>
        <p class="panel-sub">Como marcar e quanto custa</p>
      </header>

      <div class="split">
        <div class="split-media">
          <p class="split-label">Como reservar</p>
          <img src="/images/tie_sports_poster.png" alt="Instruções Tie Sports — New Padel Viseu" />
        </div>

        <div class="split-data">
          <p class="split-label">Campo · por pessoa · mín. 4</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th></th><th>1h</th><th>1h30</th></tr></thead>
              <tbody>
                <tr><th>Light Sócio</th><td>4,50 €</td><td>6,50 €</td></tr>
                <tr><th>Light Não Sócio</th><td>5,50 €</td><td>7,50 €</td></tr>
                <tr><th>Prime Sócio</th><td>6,50 €</td><td>8,50 €</td></tr>
                <tr><th>Prime Não Sócio</th><td>7,50 €</td><td>9,50 €</td></tr>
              </tbody>
            </table>
          </div>
          <div class="panel-note">
            <div><b>LIGHT</b> — Seg–sex, 9h–17h.</div>
            <div><b>PRIME</b> — Seg–sex 17h–24h · fins-de-semana e feriados 9h–24h.</div>
            <div>Valores com IVA.</div>
          </div>
        </div>
      </div>
    </section>

    <section id="patrocinadores" class="panel">
      <header class="panel-head">
        <p class="panel-eye">04</p>
        <h2>Parceiros</h2>
        <p class="panel-sub">Patrocinadores oficiais</p>
      </header>

      <div class="partner-rail">
        <a class="partner" target="_blank" rel="noopener" href="https://www.remax.pt/dinamica">
          <img src="/images/partners/oficial_remax_dinamica.svg" alt="Remax Dinâmica">
        </a>
        <div class="partner"><img src="/images/partners/permedia.png" alt="Permedia"></div>
        <div class="partner"><img src="/images/partners/aura-event-lab.png" alt="Aura Event Lab"></div>
        <a class="partner" target="_blank" rel="noopener" href="https://instagram.com/heinekenpt">
          <img src="/images/partners/oficial_heineken.svg" alt="Heineken">
        </a>
        <div class="partner"><img src="/images/partners/oficial_bandida.png" alt="Bandida do Pomar"></div>
        <div class="partner"><img src="/images/partners/oficial_obliqo.svg" alt="Obliqo"></div>
        <div class="partner"><img src="/images/partners/CN_quintaperpita.svg" alt="Quinta da Perpita"></div>
        <div class="partner"><img src="/images/partners/Protectvis.png" alt="Protectvis"></div>
      </div>
    </section>

    <section id="eventos" class="panel">
      <header class="panel-head">
        <p class="panel-eye">05</p>
        <h2>Eventos</h2>
        <p class="panel-sub">Desporto + convívio</p>
      </header>

      <p class="panel-lead">
        Organizamos a experiência completa para grupos, empresas, amigos e famílias —
        campos, dinâmica e suporte no local.
      </p>

      <div class="event-grid">
        <article><h3>Festa Kids</h3><p>Campo + jogos + lanche. Ideal para primeiras raquetadas.</p></article>
        <article><h3>Aniversário Padel</h3><p>Mini-torneio entre amigos, formato rápido e descontraído.</p></article>
        <article><h3>Team Building</h3><p>Competição amigável ou clínica — adaptado ao grupo.</p></article>
        <article><h3>Torneio Privado</h3><p>Grupos, eliminatórias e horários definidos.</p></article>
      </div>

      <p class="panel-note">Diz-nos pessoas, idade e data — enviamos proposta.</p>
    </section>

    <section id="contactos" class="panel panel--last">
      <header class="panel-head">
        <p class="panel-eye">06</p>
        <h2>Contactos</h2>
        <p class="panel-sub">Fala connosco</p>
      </header>

      <div class="contact-block">
        <a class="contact-big" href="https://wa.me/351910715689" target="_blank" rel="noopener">
          +351 910 715 689
          <svg class="contact-big__icon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M8 8h8v8M16 8l-9 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </a>
        <a class="contact-mail" href="mailto:geral@newpadel.pt">geral@newpadel.pt</a>
        <div class="contact-actions">
          <a href="https://wa.me/351910715689" target="_blank" rel="noopener">WhatsApp</a>
          <a href="https://www.instagram.com/newpadelcdfviseu" target="_blank" rel="noopener">Instagram</a>
          <a href="https://www.facebook.com/newpadelcdfviseu" target="_blank" rel="noopener">Facebook</a>
          <a href="{{ $circuitoUrl }}" target="_blank" rel="noopener">Circuito</a>
        </div>
      </div>

      <div class="map-shell">
        <iframe
          title="Mapa New Padel Viseu"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.37151734003!2d-7.904607284734797!3d40.64374017933935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd233730500250ad%3A0x2bf80e07e7772797!2sNew%20Padel%20Ch%C3%A3o%20da%20Fonte%20-%20Viseu!5e0!3m2!1spt-PT!2spt!4v1635858609699!5m2!1spt-PT!2spt"
          loading="lazy"
          allowfullscreen=""
        ></iframe>
      </div>

      <p class="foot">© 2027 New Padel</p>
    </section>

  </main>

  {{-- DOCK: menu em baixo (app) --}}
  <nav class="dock" aria-label="Menu principal">
    <a href="#top" class="dock-item dock-item--home">
      <span class="dock-ico" aria-hidden="true"></span>
      <span>Home</span>
    </a>
    <a href="#socio" class="dock-item">
      <span class="dock-ico" aria-hidden="true"></span>
      <span>Sócio</span>
    </a>
    <a href="#academia" class="dock-item">
      <span class="dock-ico" aria-hidden="true"></span>
      <span>Academia</span>
    </a>
    <a href="#reservas" class="dock-item">
      <span class="dock-ico" aria-hidden="true"></span>
      <span>Reservas</span>
    </a>
    <a href="#contactos" class="dock-item">
      <span class="dock-ico" aria-hidden="true"></span>
      <span>Contacto</span>
    </a>
  </nav>

</div>
@endsection

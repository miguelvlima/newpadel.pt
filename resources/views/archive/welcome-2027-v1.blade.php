@extends('layouts.app')

@section('title', 'New Padel')

@section('content')
@php
  $circuitoUrl = 'https://www.circuitosocialregionaldepadel.pt/';
@endphp

<header class="app-top" id="top">
  <div class="app-top__inner">
    <a class="app-brand" href="#top" aria-label="New Padel">
      <img src="/images/LOGO_WhiteStripes.png" alt="" width="36" height="36" />
      <span>New Padel</span>
    </a>
    <nav class="app-nav" aria-label="Navegação">
      <a class="chip" href="#socio">Sócio</a>
      <a class="chip" href="#academia">Academia</a>
      <a class="chip" href="#reservas">Reservas</a>
      <a class="chip" href="#patrocinadores">Parceiros</a>
      <a class="chip" href="#eventos">Eventos</a>
      <a class="chip" href="#contactos">Contactos</a>
      <a class="chip chip--ext" href="{{ $circuitoUrl }}" target="_blank" rel="noopener">Circuito</a>
    </nav>
  </div>
</header>

<main class="wrap">

  <section class="hero" aria-label="Apresentação">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="hero-kicker">Chão da Fonte · Viseu</p>
        <h1 class="hero-brand">New Padel</h1>
        <p class="hero-lead">Quatro campos cobertos, academia e espaço para jogar e conviver — tudo no mesmo sítio.</p>

        <div class="features" aria-label="Comodidades">
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>4 campos cobertos</span></div>
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>Estacionamento privativo</span></div>
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>Carregadores elétricos</span></div>
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>Cafetaria</span></div>
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>Loja de padel</span></div>
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>Esplanada 150 m²</span></div>
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>Parque infantil</span></div>
          <div class="feature"><span class="ico" aria-hidden="true"></span><span>Balneários completos</span></div>
        </div>
      </div>

      <div class="video-frame" aria-label="Vídeo de apresentação">
        <video
          src="/media/intro-story.mp4"
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
          poster="/media/intro-poster.jpg"
        ></video>
      </div>
    </div>
  </section>

  <section id="socio" class="section">
    <div class="section-head">
      <h2>Sócio New Padel</h2>
      <p class="hint">Modalidades e vantagens</p>
    </div>

    <div class="card">
      <div class="membership-grid">
        <article class="membership">
          <div class="membership-top">
            <div class="membership-title">BLACK</div>
            <div class="membership-price">60 € <span>/ ano</span></div>
          </div>
          <ul class="membership-list">
            <li>Desconto de <b>1 €</b> em cada reserva de campo.</li>
            <li>Desconto de <b>5%</b> na inscrição em aulas.</li>
            <li>Desconto na inscrição em torneios realizados no clube.</li>
            <li>Oferta (pessoal e intransmissível) de um jogo de <b>1h30</b> no dia de aniversário.</li>
          </ul>
        </article>

        <article class="membership membership--featured">
          <div class="membership-top">
            <div class="membership-title">WHITE</div>
            <div class="membership-price">1000 € <span>/ ano</span></div>
            <div class="membership-subprice">ou <b>100 € / mês</b> (fidelização de 1 ano)</div>
          </div>
          <ul class="membership-list">
            <li>Livre-trânsito para marcação e realização de jogos (mediante disponibilidade dos campos).</li>
            <li>Desconto de <b>5%</b> na inscrição em aulas.</li>
            <li>Desconto na inscrição em torneios realizados no clube.</li>
            <li>Oferta de um campo por <b>1h30</b> no dia de aniversário.</li>
          </ul>
        </article>
      </div>

      <div class="note">
        Contacta o <b>910 715 689</b> para mais informações. Os valores apresentados incluem IVA à taxa legal em vigor.
      </div>
    </div>
  </section>

  <section id="academia" class="section">
    <div class="section-head">
      <h2>Academia</h2>
      <p class="hint">Mensalidades e packs</p>
    </div>

    <div class="card">
      <div class="academy-grid">

        <div class="academy-block">
          <div class="academy-title">Matrícula mensal — Adultos</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th class="t-center">1× semana</th>
                  <th class="t-center">2× semana</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Light Sócio</th><td class="t-center">48 €</td><td class="t-center">82 €</td>
                </tr>
                <tr>
                  <th>Light Não Sócio</th><td class="t-center">52 €</td><td class="t-center">86 €</td>
                </tr>
                <tr>
                  <th>Prime Sócio</th><td class="t-center">60 €</td><td class="t-center">104 €</td>
                </tr>
                <tr>
                  <th>Prime Não Sócio</th><td class="t-center">63 €</td><td class="t-center">109 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="academy-block">
          <div class="academy-title">Matrícula mensal — Crianças</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th class="t-center">1× semana</th>
                  <th class="t-center">2× semana</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Light Sócio</th><td class="t-center">38 €</td><td class="t-center">60 €</td>
                </tr>
                <tr>
                  <th>Light Não Sócio</th><td class="t-center">40 €</td><td class="t-center">63 €</td>
                </tr>
                <tr>
                  <th>Prime Sócio</th><td class="t-center">48 €</td><td class="t-center">70 €</td>
                </tr>
                <tr>
                  <th>Prime Não Sócio</th><td class="t-center">52 €</td><td class="t-center">75 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="academy-block">
          <div class="academy-title">Pack aulas — 1 adulto</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th class="t-center">1 aula</th>
                  <th class="t-center">4 aulas</th>
                  <th class="t-center">10 aulas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Light Sócio</th><td class="t-center">41 €</td><td class="t-center">151 €</td><td class="t-center">314 €</td>
                </tr>
                <tr>
                  <th>Light Não Sócio</th><td class="t-center">44 €</td><td class="t-center">159 €</td><td class="t-center">331 €</td>
                </tr>
                <tr>
                  <th>Prime Sócio</th><td class="t-center">46 €</td><td class="t-center">173 €</td><td class="t-center">352 €</td>
                </tr>
                <tr>
                  <th>Prime Não Sócio</th><td class="t-center">49 €</td><td class="t-center">182 €</td><td class="t-center">371 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="academy-block">
          <div class="academy-title">Pack aulas — 2 adultos</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th class="t-center">1 aula</th>
                  <th class="t-center">4 aulas</th>
                  <th class="t-center">10 aulas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Light Sócio</th><td class="t-center">24 €</td><td class="t-center">79 €</td><td class="t-center">177 €</td>
                </tr>
                <tr>
                  <th>Light Não Sócio</th><td class="t-center">26 €</td><td class="t-center">84 €</td><td class="t-center">190 €</td>
                </tr>
                <tr>
                  <th>Prime Sócio</th><td class="t-center">30 €</td><td class="t-center">107 €</td><td class="t-center">199 €</td>
                </tr>
                <tr>
                  <th>Prime Não Sócio</th><td class="t-center">32 €</td><td class="t-center">113 €</td><td class="t-center">210 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="academy-block">
          <div class="academy-title">Pack aulas — 1 criança</div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th class="t-center">1 aula</th>
                  <th class="t-center">4 aulas</th>
                  <th class="t-center">10 aulas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Light Sócio</th><td class="t-center">37 €</td><td class="t-center">139 €</td><td class="t-center">298 €</td>
                </tr>
                <tr>
                  <th>Light Não Sócio</th><td class="t-center">40 €</td><td class="t-center">147 €</td><td class="t-center">314 €</td>
                </tr>
                <tr>
                  <th>Prime Sócio</th><td class="t-center">43 €</td><td class="t-center">155 €</td><td class="t-center">330 €</td>
                </tr>
                <tr>
                  <th>Prime Não Sócio</th><td class="t-center">45 €</td><td class="t-center">164 €</td><td class="t-center">348 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div class="note">
        <div><b>LIGHT</b> — Segunda a sexta, 9h–17h.</div>
        <div><b>PRIME</b> — Segunda a sexta, 17h–24h · Sábados, domingos e feriados, 9h–24h.</div>
        <div>Os valores apresentados são por pessoa e incluem IVA à taxa legal em vigor.</div>
      </div>
    </div>
  </section>

  <section id="reservas" class="section">
    <div class="section-head">
      <h2>Reservas</h2>
      <p class="hint">Instruções e preços</p>
    </div>

    <div class="card">
      <div class="reservas-grid">
        <div class="reservas-left">
          <div class="reservas-title">Como reservar</div>
          <p class="reservas-text">Para efetuares reservas no clube, segue as instruções:</p>
          <img
            class="reservas-poster"
            src="/images/tie_sports_poster.png"
            alt="Connect to New Padel Chão da Fonte - Viseu"
          />
        </div>

        <div class="reservas-right">
          <div class="reservas-title">Reserva de campo</div>
          <p class="reservas-sub">Por pessoa · mínimo 4</p>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th></th>
                  <th class="t-center">1h</th>
                  <th class="t-center">1h30</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Light Sócio</th>
                  <td class="t-center">4,50 €</td>
                  <td class="t-center">6,50 €</td>
                </tr>
                <tr>
                  <th>Light Não Sócio</th>
                  <td class="t-center">5,50 €</td>
                  <td class="t-center">7,50 €</td>
                </tr>
                <tr>
                  <th>Prime Sócio</th>
                  <td class="t-center">6,50 €</td>
                  <td class="t-center">8,50 €</td>
                </tr>
                <tr>
                  <th>Prime Não Sócio</th>
                  <td class="t-center">7,50 €</td>
                  <td class="t-center">9,50 €</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="note note--flush">
            <div><b>LIGHT</b> — Segunda a sexta, 9h–17h.</div>
            <div><b>PRIME</b> — Segunda a sexta, 17h–24h · Sábados, domingos e feriados, 9h–24h.</div>
            <div>Valores com IVA. Mínimo de <b>4 pessoas</b> por reserva de campo.</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="patrocinadores" class="section">
    <div class="section-head">
      <h2>Patrocinadores Oficiais</h2>
      <p class="hint">Parcerias do clube</p>
    </div>
    <div class="card">
      <div class="partners">
        <a class="partner" target="_blank" rel="noopener" href="https://www.remax.pt/dinamica">
          <img src="/images/partners/oficial_remax_dinamica.svg" alt="Remax Dinâmica">
        </a>
        <div class="partner"><img class="logo-boost" src="/images/partners/permedia.png" alt="Permedia"></div>
        <div class="partner"><img class="logo-boost" src="/images/partners/aura-event-lab.png" alt="Aura Event Lab"></div>
        <a class="partner" target="_blank" rel="noopener" href="https://instagram.com/heinekenpt">
          <img src="/images/partners/oficial_heineken.svg" alt="Heineken">
        </a>
        <div class="partner"><img src="/images/partners/oficial_bandida.png" alt="Bandida do Pomar"></div>
        <div class="partner"><img class="logo-boost logo-boost--wide" src="/images/partners/oficial_obliqo.svg" alt="Obliqo"></div>
        <div class="partner"><img src="/images/partners/CN_quintaperpita.svg" alt="Quinta da Perpita"></div>
        <div class="partner"><img src="/images/partners/Protectvis.png" alt="Protectvis"></div>
      </div>
    </div>
  </section>

  <section id="eventos" class="section">
    <div class="section-head">
      <h2>Eventos e Festas de Aniversário</h2>
      <p class="hint">Dois em um: desporto + convívio</p>
    </div>

    <div class="card">
      <div class="events-grid">
        <div class="events-hero">
          <div class="events-kicker">Para grupos, empresas, amigos e famílias</div>
          <h3 class="events-title">Organizamos a experiência completa</h3>
          <p class="events-text">
            Queres um evento animado e bem organizado? Nós tratamos do essencial: campos, dinâmica, espaço para convívio e
            suporte no local — a ti basta aproveitares.
          </p>
        </div>

        <div class="events-cards">
          <div class="mini-card">
            <div class="mini-card__title">Festa Kids</div>
            <div class="mini-card__desc">Campo + jogos divertidos + tempo de lanche. Ideal para primeiras raquetadas.</div>
          </div>
          <div class="mini-card">
            <div class="mini-card__title">Aniversário Padel</div>
            <div class="mini-card__desc">Mini-torneio entre amigos com formato rápido e descontraído.</div>
          </div>
          <div class="mini-card">
            <div class="mini-card__title">Empresa / Team Building</div>
            <div class="mini-card__desc">Competição amigável, clínica para iniciantes ou misto — adaptado ao grupo.</div>
          </div>
          <div class="mini-card">
            <div class="mini-card__title">Torneio Privado</div>
            <div class="mini-card__desc">Formato “a sério”, com grupos, eliminatórias e horários definidos.</div>
          </div>
        </div>
      </div>

      <div class="note">
        Diz-nos o número de pessoas, faixa etária e a data pretendida. Responderemos com uma proposta ajustada ao teu grupo.
      </div>
    </div>
  </section>

  <section id="contactos" class="section">
    <div class="section-head">
      <h2>Contactos</h2>
      <p class="hint">Fala connosco</p>
    </div>

    <div class="contacts">
      <div class="card contact-card">
        <div class="contact-line"><b>Telefone:</b> <a href="tel:+351910715689">+351 910 715 689</a></div>
        <div class="contact-line"><b>Email:</b> <a href="mailto:geral@newpadel.pt">geral@newpadel.pt</a></div>
        <div class="actions">
          <a class="btn" target="_blank" rel="noopener" href="https://www.facebook.com/newpadelcdfviseu">Facebook</a>
          <a class="btn" target="_blank" rel="noopener" href="https://www.instagram.com/newpadelcdfviseu">Instagram</a>
          <a class="btn btn--primary" target="_blank" rel="noopener" href="https://wa.me/351910715689">WhatsApp</a>
        </div>
      </div>

      <div class="card map-card">
        <iframe
          class="map"
          title="Mapa New Padel Viseu"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.37151734003!2d-7.904607284734797!3d40.64374017933935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd233730500250ad%3A0x2bf80e07e7772797!2sNew%20Padel%20Ch%C3%A3o%20da%20Fonte%20-%20Viseu!5e0!3m2!1spt-PT!2spt!4v1635858609699!5m2!1spt-PT!2spt"
          allowfullscreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  </section>

  <footer class="footer">
    © {{ date('Y') }} New Padel
  </footer>

</main>
@endsection

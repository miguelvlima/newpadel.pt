@extends('layouts.app')

@section('title', 'New Padel')

@section('content')
@php
  $circuitoUrl = 'https://www.circuitosocialregionaldepadel.pt/';
@endphp

<div class="wrap">

  <div class="top">

    <nav class="nav" aria-label="Navegação">
      <a class="chip" href="#socio">Sócio</a>
      <a class="chip" href="#academia">Academia</a>
      <a class="chip" href="#reservas">Reservas</a>
      <a class="chip" href="#patrocinadores">Patrocinadores Oficiais</a>
      <a class="chip" href="#eventos">Eventos e Festas de Aniversário</a>
      <a class="chip" href="#contactos">Contactos</a>
      <a class="chip" href="{{ $circuitoUrl }}" target="_blank" rel="noopener">Circuito Social Regional de Padel</a>
    </nav>
  </div>

  <section class="hero">
    <div class="hero-grid">
      <div>
        <div class="hero-info">
          <img class="hero-logo" src="/images/LOGO_WhiteStripes.png" alt="New Padel">
          <h1>New Padel Chão da Fonte - Viseu</h1>
        </div>

        <div class="features" aria-label="Comodidades">
          <div class="feature"><span class="ico">🏟️</span><span>4 Campos cobertos</span></div>
          <div class="feature"><span class="ico">🅿️</span><span>Estacionamento privativo</span></div>
          <div class="feature"><span class="ico">⚡</span><span>Carregadores para carros elétricos</span></div>
          <div class="feature"><span class="ico">☕</span><span>Cafetaria</span></div>
          <div class="feature"><span class="ico">🛍️</span><span>Loja de produtos de padel</span></div>
          <div class="feature"><span class="ico">🌿</span><span>Esplanada com 150 m²</span></div>
          <div class="feature"><span class="ico">🧸</span><span>Parque infantil</span></div>
          <div class="feature"><span class="ico">🚿</span><span>Balneários completos</span></div>
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

      <div class="membership">
        <div class="membership-top">
          <div>
            <div class="membership-title">BLACK</div>
            <div class="membership-price">60 € <span>/ ano</span></div>
          </div>
        </div>

        <ul class="membership-list">
          <li>Desconto de <b>1 €</b> em cada reserva de campo.</li>
          <li>Desconto de <b>5%</b> na inscrição em aulas.</li>
          <li>Desconto na inscrição em torneios realizados no clube.</li>
          <li>Oferta (pessoal e intransmissível) de um jogo de <b>1h30</b> no dia de aniversário.</li>
        </ul>
      </div>

      <div class="membership">
        <div class="membership-top">
          <div>
            <div class="membership-title">WHITE</div>
            <div class="membership-price">1000 € <span>/ ano</span></div>
            <div class="membership-subprice">ou <b>100 € / mês</b> (fidelização de 1 ano)</div>
          </div>
        </div>

        <ul class="membership-list">
          <li>Livre-trânsito para marcação e realização de jogos (mediante disponibilidade dos campos).</li>
          <li>Desconto de <b>5%</b> na inscrição em aulas.</li>
          <li>Desconto na inscrição em torneios realizados no clube.</li>
          <li>Oferta de um campo por <b>1h30</b> no dia de aniversário.</li>
        </ul>
      </div>

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

      {{-- Mensalidade Adultos --}}
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
                <th>Light Sócio</th><td class="t-center">42 €</td><td class="t-center">71 €</td>
              </tr>
              <tr>
                <th>Light Não Sócio</th><td class="t-center">45 €</td><td class="t-center">75 €</td>
              </tr>
              <tr>
                <th>Prime Sócio</th><td class="t-center">52 €</td><td class="t-center">90 €</td>
              </tr>
              <tr>
                <th>Prime Não Sócio</th><td class="t-center">55 €</td><td class="t-center">95 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {{-- Mensalidade Crianças --}}
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
                <th>Light Sócio</th><td class="t-center">33 €</td><td class="t-center">52 €</td>
              </tr>
              <tr>
                <th>Light Não Sócio</th><td class="t-center">35 €</td><td class="t-center">55 €</td>
              </tr>
              <tr>
                <th>Prime Sócio</th><td class="t-center">42 €</td><td class="t-center">61 €</td>
              </tr>
              <tr>
                <th>Prime Não Sócio</th><td class="t-center">45 €</td><td class="t-center">65 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {{-- Pack 1 adulto --}}
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
                <th>Light Sócio</th><td class="t-center">36 €</td><td class="t-center">131 €</td><td class="t-center">273 €</td>
              </tr>
              <tr>
                <th>Light Não Sócio</th><td class="t-center">38 €</td><td class="t-center">138 €</td><td class="t-center">288 €</td>
              </tr>
              <tr>
                <th>Prime Sócio</th><td class="t-center">40 €</td><td class="t-center">150 €</td><td class="t-center">306 €</td>
              </tr>
              <tr>
                <th>Prime Não Sócio</th><td class="t-center">43 €</td><td class="t-center">158 €</td><td class="t-center">323 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {{-- Pack 2 adultos --}}
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
                <th>Light Sócio</th><td class="t-center">21 €</td><td class="t-center">69 €</td><td class="t-center">154 €</td>
              </tr>
              <tr>
                <th>Light Não Sócio</th><td class="t-center">23 €</td><td class="t-center">73 €</td><td class="t-center">165 €</td>
              </tr>
              <tr>
                <th>Prime Sócio</th><td class="t-center">26 €</td><td class="t-center">93 €</td><td class="t-center">173 €</td>
              </tr>
              <tr>
                <th>Prime Não Sócio</th><td class="t-center">28 €</td><td class="t-center">98 €</td><td class="t-center">183 €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {{-- Pack 1 criança --}}
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
                <th>Light Sócio</th><td class="t-center">32 €</td><td class="t-center">121 €</td><td class="t-center">259 €</td>
              </tr>
              <tr>
                <th>Light Não Sócio</th><td class="t-center">35 €</td><td class="t-center">128 €</td><td class="t-center">273 €</td>
              </tr>
              <tr>
                <th>Prime Sócio</th><td class="t-center">37 €</td><td class="t-center">135 €</td><td class="t-center">287 €</td>
              </tr>
              <tr>
                <th>Prime Não Sócio</th><td class="t-center">39 €</td><td class="t-center">143 €</td><td class="t-center">303 €</td>
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
        <p class="reservas-text">
          Para efetuares reservas no clube, segue as instruções:
        </p>

        <img
          class="reservas-poster"
          src="/images/tie_sports_poster.png"
          alt="Connect to New Padel Chão da Fonte - Viseu"
        />

        {{-- Se tiveres um link direto para reservas, podemos ligar aqui --}}
        {{-- <a class="btn primary" href="https://..." target="_blank" rel="noopener">Abrir reservas</a> --}}
      </div>

      <div class="reservas-right">
        <div class="reservas-title">Tabela de preços</div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th class="t-center">1h</th>
                <th class="t-center">1h30m</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>LIGHT SÓCIO</th>
                <td class="t-center">3,5 €</td>
                <td class="t-center">5,5 €</td>
              </tr>
              <tr>
                <th>LIGHT NÃO SÓCIO</th>
                <td class="t-center">4,5 €</td>
                <td class="t-center">6,5 €</td>
              </tr>
              <tr>
                <th>PRIME SÓCIO</th>
                <td class="t-center">5,5 €</td>
                <td class="t-center">7,5 €</td>
              </tr>
              <tr>
                <th>PRIME NÃO SÓCIO</th>
                <td class="t-center">6,5 €</td>
                <td class="t-center">8,5 €</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="note" style="margin-top:12px;">
          <div><b>LIGHT</b> — Segunda a sexta, 9h–17h.</div>
          <div><b>PRIME</b> — Segunda a sexta, 17h–24h · Sábados, domingos e feriados, 9h–24h.</div>
          <div>Os valores apresentados são por pessoa e incluem IVA à taxa legal em vigor.</div>
          <div>Deve ser considerado um mínimo de <b>4 pessoas</b> por reserva de campo.</div>
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
        <div class="partner"><img class="logo-boost" src="/images/partners/dietmed.png" alt="Dietmed"></div>
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

      <div class="events-break"></div>

      <div class="events-cards">
        <div class="mini-card">
          <div class="mini-card__title">Festa Kids</div>
          <div class="mini-card__desc">Campo + jogos divertidos + tempo de lanche. Ideal para primeiras raquetadas.</div>
          <div class="mini-card__bullets">
            <span>🧸 Parque infantil</span>
            <span>🏓 Jogos guiados</span>
            <span>🍰 Momento parabéns</span>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-card__title">Aniversário Padel</div>
          <div class="mini-card__desc">Mini-torneio entre amigos com formato rápido e descontraído.</div>
          <div class="mini-card__bullets">
            <span>🎾 Equipas rotativas</span>
            <span>⏱️ Jogos curtos</span>
            <span>🏅 Final simbólica</span>
            <span>🍰 Momento parabéns</span>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-card__title">Empresa / Team Building</div>
          <div class="mini-card__desc">Competição amigável, clínica para iniciantes ou misto — adaptado ao grupo.</div>
          <div class="mini-card__bullets">
            <span>🤝 Dinâmicas</span>
            <span>📊 Organização</span>
            <span>🥂 Welcome drink / convívio</span>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-card__title">Torneio Privado</div>
          <div class="mini-card__desc">Formato “a sério”, com grupos, eliminatórias e horários definidos.</div>
          <div class="mini-card__bullets">
            <span>🏆 Quadro</span>
            <span>📅 Planeamento</span>
            <span>🎤 Ambiente</span>
          </div>
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
        <div class="contact-line"><b>Telefone:</b> +351 910 715 689</div>
        <div class="contact-line"><b>Email:</b> <a href="mailto:geral@newpadel.pt">geral@newpadel.pt</a></div>

        <div class="actions" style="margin-top:14px;">
          <a class="btn" target="_blank" href="https://www.facebook.com/newpadelcdfviseu">Facebook</a>
          <a class="btn" target="_blank" href="https://www.instagram.com/newpadelcdfviseu">Instagram</a>
          <a class="btn" target="_blank" href="https://web.whatsapp.com/send?phone=00351910715689">WhatsApp</a>
        </div>
      </div>

      <div class="card map-card">
        <iframe
          class="map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.37151734003!2d-7.904607284734797!3d40.64374017933935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd233730500250ad%3A0x2bf80e07e7772797!2sNew%20Padel%20Ch%C3%A3o%20da%20Fonte%20-%20Viseu!5e0!3m2!1spt-PT!2spt!4v1635858609699!5m2!1spt-PT!2spt"
          allowfullscreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  </section>

  <div class="footer">
    © {{ date('Y') }} New Padel
  </div>

</div>
@endsection

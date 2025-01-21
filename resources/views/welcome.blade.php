@extends('layouts.app')

@section('content')

    <!-- Page Wrapper -->
    <div id="page-wrapper">
        <!-- Header -->
        <header id="header" class="alt">
            <h1>
                <a href="index.html">
                    <div>
                        <img class="headerimage" src="/images/LOGO_WhiteStripes.png" alt="New Padel" style="margin-top:3px;vertical-align:top;">
                    </div>
                </a>
            </h1>
            <nav id="nav">
                <ul>
                    <li class="special">
                        <a href="#menu" class="menuToggle"><span>Menu</span></a>
                        <div id="menu">
                            <ul>
                                <li><a href="#newpadeltour" class="more scrolly">NEW PADEL TOUR 2025</a></li>
                                <li><a href="#campanha" class="more scrolly">SÓCIO NEW PADEL</a></li>
                                <li><a href="#academia" class="more scrolly">ACADEMIA</a></li>
                                <li><a href="#reservas" class="more scrolly">RESERVAS</a></li>
                                <li><a href="#parcerias" class="more scrolly">PARCERIAS</a></li>
                                <li><a href="#contactos" class="more scrolly">CONTACTOS</a></li>
                            </ul>
                        </div>
                    </li>
                </ul>
            </nav>
        </header>
        <!-- Banner -->
        <section id="banner">
            <div class="inner">

                <img id="newpadelset2023" src="/images/LOGO_WhiteStripes.png" alt="New Padel">
                <ul class="icons">
                    <li><a target="_blank" href="https://www.facebook.com/newpadelcdfviseu" class="icon brands fa-facebook-f" style="font-size: 30pt;color:white;"><span class="label">Facebook</span></a></li>
                    <li><a target="_blank" href="https://www.instagram.com/newpadelcdfviseu" class="icon brands fa-instagram" style="font-size: 30pt;color:white;"><span class="label">Instagram</span></a></li>
                    <li><a target="_blank" href="https://web.whatsapp.com/send?phone=00351910715689" class="icon brands fa-whatsapp" style="font-size: 30pt;color:white;"><span class="label">WhatsApp</span></a></li>

                </ul>

            </div>
        </section>

        <!-- New Padel Tour -->
        <section id="newpadeltour" class="wrapper style2 special">
            <div class="inner">
                <header class="major">
                    <img id="NPT2025logo" src="/images/NPT2025.png" alt="New Padel Tour 2025">
                </header>
            </div>
            <div class="inner">
                <h4>
                    <p>
                        <b>A edição de 2025 do NEW PADEL TOUR está dividida em duas duas fases: a primeira, entre Fevereiro e Julho, e a segunda, entre Agosto e Dezembro, dando ambas, de forma independente, acesso ao <b>NEW PADEL MASTERS 2025</b>, em Janeiro de 2026.
                    </p>
                    <div class="comments">
                        <ul>
                            <li style="text-align: left;"><font style="opacity:0.5;">REGULAMENTO</font>
                                <ul>
                                    <li style="text-align: left;">Consulta o regulamento do NEW PADEL TOUR 2025 <a href="docs/NEW PADEL TOUR 2025 - REGULAMENTO.pdf" target="_blank">AQUI</a>.</li>
                                </ul>
                            </li>
                            </br>
                            <li style="text-align: left;"><b><font style="opacity:0.5;">CALENDÁRIO FASE 1</font></b>
                                <div class="tabs-container">
                                    </br>
                                    <ul class="tabs">
                                        <li class="active">
                                            <a href=""><font style="color:black;">FEVEREIRO</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">MARÇO</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">ABRIL</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">MAIO</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">JUNHO</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">JULHO</font></a>
                                        </li>
                                    </ul>
                                    <div class="tabs-content">
                                        <div class="tabs-panel active" data-index="0">
                                            <p><img style="margin-left:10px; width:300px;" class="calendarimage" src="/images/FEV.png" alt="New Padel Tour - Calendário Fase 1 - Fevereiro" onclick="window.open(this.src, '_blank');"></p>
                                            <p><font size="2" color="white">* O calendário apresentado é meramente indicativo e pode sofrer alterações em qualquer altura.</font></p>
                                        </div>
                                        <div class="tabs-panel" data-index="1">
                                            <p><img style="margin-left:10px; width:300px;" class="calendarimage" src="/images/MAR.png" alt="New Padel Tour - Calendário Fase 1 - Março" onclick="window.open(this.src, '_blank');"></p>
                                            <p><font size="2" color="white">* O calendário apresentado é meramente indicativo e pode sofrer alterações em qualquer altura.</font></p>
                                        </div>
                                        <div class="tabs-panel" data-index="2">
                                            <p><img style="margin-left:10px; width:300px;" class="calendarimage" src="/images/ABR.png" alt="New Padel Tour - Calendário Fase 1 - Abril" onclick="window.open(this.src, '_blank');"></p>
                                            <p><font size="2" color="white">* O calendário apresentado é meramente indicativo e pode sofrer alterações em qualquer altura.</font></p>
                                        </div>
                                        <div class="tabs-panel" data-index="3">
                                            <p><img style="margin-left:10px; width:300px;" class="calendarimage" src="/images/MAI.png" alt="New Padel Tour - Calendário Fase 1 - Maio" onclick="window.open(this.src, '_blank');"></p>
                                            <p><font size="2" color="white">* O calendário apresentado é meramente indicativo e pode sofrer alterações em qualquer altura.</font></p>
                                        </div>
                                        <div class="tabs-panel" data-index="4">
                                            <p><img style="margin-left:10px; width:300px;" class="calendarimage" src="/images/JUN.png" alt="New Padel Tour - Calendário Fase 1 - Junho" onclick="window.open(this.src, '_blank');"></p>
                                            <p><font size="2" color="white">* O calendário apresentado é meramente indicativo e pode sofrer alterações em qualquer altura.</font></p>
                                        </div>
                                        <div class="tabs-panel" data-index="5">
                                            <p><img style="margin-left:10px; width:300px;" class="calendarimage" src="/images/JUL.png" alt="New Padel Tour - Calendário Fase 1 - Julho" onclick="window.open(this.src, '_blank');"></p>
                                            <p><font size="2" color="white">* O calendário apresentado é meramente indicativo e pode sofrer alterações em qualquer altura.</font></p>
                                        </div>
                                    </div>
                                </div>
                            </li>
                            </br>
                            <li style="text-align: left;"><b><font style="opacity:0.5;">RANKING FASE 1</font></b>
                                <div class="tabsRank-container">
                                    <ul class="tabsRank">
                                        <li class="active">
                                            <a href=""><font style="color:black;">M2</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">M3</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">M4</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">M5</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">F4</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">F5</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">MX3</font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="color:black;">MX4</font></a>
                                        </li>
                                    </ul>
                                    <div class="tabsRank-content">
                                        <div class="tabsRank-panel active" data-index="0">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/7a803300-c54f-49d5-96b5-2cbd6a6bbcbd">Aceda ao ranking M2 da primeira fase AQUI.</a>
                                        </div>
                                        <div class="tabsRank-panel" data-index="1">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/dc32d083-b423-4df2-bc5e-08057dc171d7">Aceda ao ranking M3 da primeira fase AQUI.</a>
                                        </div>
                                        <div class="tabsRank-panel" data-index="2">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/79981824-7532-494e-b236-3fb378c0990d">Aceda ao ranking M4 da primeira fase AQUI.</a>
                                        </div>
                                        <div class="tabsRank-panel" data-index="3">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/8f366b80-88bd-48fc-8de0-a36c653e8b2b">Aceda ao ranking M5 da primeira fase AQUI.</a>
                                        </div>
                                        <div class="tabsRank-panel" data-index="4">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/6f7b7f5e-f68b-4ae7-9562-d25ccf9634c3">Aceda ao ranking F4 da primeira fase AQUI.</a>
                                        </div>
                                        <div class="tabsRank-panel" data-index="5">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/6518768b-b43c-40cf-8b11-ab6b24b108fb">Aceda ao ranking F5 da primeira fase AQUI.</a>
                                        </div>
                                        <div class="tabsRank-panel" data-index="6">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/282d8a4e-31ec-466e-b8e4-d18426ecee42">Aceda ao ranking MX3 da segunda fase AQUI.</a>
                                        </div>
                                        <div class="tabsRank-panel" data-index="7">
                                            </br>
                                            <a target="_blank" href="https://www.tiepadel.com/Rankings/32c9148a-214b-4de5-ad95-ef6b6a9dd9c4">Aceda ao ranking MX4 da segunda fase AQUI.</a>
                                        </div>

                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </h4>
            </div>
        </section>
        <!-- Campanha sócio fundador -->
        <section id="campanha" class="wrapper style2 special">
            <div class="inner">
                <header class="major">
                    <h2>SÓCIO NEW PADEL</h2>
                </header>
            </div>
            <div class="inner">
                <h3>
                    Junta-te a nós e torna-te sócio do clube:
                </h3>
                <table class="table table-striped w-auto">
                    <tbody>
                    <tr>
                        <th scope="row">
                            BLACK
                            </br>
                            <ul>
                                <li style="text-align: left;">Desconto de 1 € em cada reserva de campo.</li>
                                <li style="text-align: left;">Desconto de 5% na inscrição em aulas.</li>
                                <li style="text-align: left;">Desconto na inscrição em torneios realizados no clube.</li>
                                <li style="text-align: left;">Oferta (pessoal e intransmissível) de um jogo de 1h30m no dia de aniversário.</li>

                            </ul>
                        </th>
                        <td>60 € / ANO</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">
                            WHITE
                            </br>
                            <ul>
                                <li style="text-align: left;">Livre-trânsito para marcação e realização de jogos (mediante disponibilidade dos campos).</li>
                                <li style="text-align: left;">Desconto de 5% na inscrição em aulas.</li>
                                <li style="text-align: left;">Desconto na inscrição em torneios realizados no clube.</li>
                                <li style="text-align: left;">Oferta de um campo por 1h30m no dia de aniversário.</li>

                            </ul>
                        </th>
                        <td>
                            1000 € / ANO
                            </br>
                            OU
                            </br>
                            100 € / mês (fidelização de 1 ano)

                        </td>
                    </tr>
                    </tbody>
                </table>
                <div class="comments">
                    <ul>
                        <li style="text-align: left;">Contacta o 910715689 para mais informações.</li>
                        <li style="text-align: left;">Os valores apresentados incluem IVA à taxa legal em vigor.</li>
                    </ul>
                </div>
            </div>
        </section>
        <!-- Academia -->
        <section id="academia" class="wrapper style2 special">
            <div class="inner">
                <header class="major">
                    <h2>ACADEMIA</h2>
                </header>

                <h3>
                    MATRÍCULA MENSAL ADULTOS
                </h3>
                <!-- TABELA MENSALIDADE -->
                <table class="table table-striped w-auto">
                    <thead>
                    <tr>
                        <th></th>
                        <th class="center">1 x semana</th>
                        <th class="center">2 x semana</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="table-info">
                        <th scope="row">Light Sócio</th>
                        <td>42 €</td>
                        <td>71 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Light Não Sócio</th>
                        <td>45 €</td>
                        <td>75 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Sócio</th>
                        <td>52 €</td>
                        <td>75 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Não Sócio</th>
                        <td>55 €</td>
                        <td>95 €</td>
                    </tr>
                    </tbody>
                </table>
                <h3>
                    MATRÍCULA MENSAL CRIANÇAS
                </h3>
                <!-- TABELA MENSALIDADE -->
                <table class="table table-striped w-auto">
                    <thead>
                    <tr>
                        <th></th>
                        <th class="center">1 x semana</th>
                        <th class="center">2 x semana</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="table-info">
                        <th scope="row">Light Sócio</th>
                        <td>33 €</td>
                        <td>52 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Light Não Sócio</th>
                        <td>35 €</td>
                        <td>55 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Sócio</th>
                        <td>42 €</td>
                        <td>61 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Não Sócio</th>
                        <td>45 €</td>
                        <td>65 €</td>
                    </tr>
                    </tbody>
                </table>
                <h3>
                    PACK AULAS 1 ADULTO
                </h3>
                <table class="table table-striped w-auto">
                    <thead>
                    <tr>
                        <th></th>
                        <th class="center">1 aula</th>
                        <th class="center">4 aulas</th>
                        <th class="center">10 aulas</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="table-info">
                        <th scope="row">Light Sócio</th>
                        <td>36 €</td>
                        <td>131 €</td>
                        <td>273 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Light Não Sócio</th>
                        <td>38 €</td>
                        <td>138 €</td>
                        <td>288 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Sócio</th>
                        <td>40 €</td>
                        <td>150 €</td>
                        <td>306 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Não Sócio</th>
                        <td>43 €</td>
                        <td>158 €</td>
                        <td>323 €</td>
                    </tr>
                    </tbody>
                </table>
                <h3>
                    PACK AULAS 2 ADULTOS
                </h3>
                <table class="table table-striped w-auto">
                    <thead>
                    <tr>
                        <th></th>
                        <th class="center">1 aula</th>
                        <th class="center">4 aulas</th>
                        <th class="center">10 aulas</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="table-info">
                        <th scope="row">Light Sócio</th>
                        <td>21 €</td>
                        <td>69 €</td>
                        <td>154 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Light Não Sócio</th>
                        <td>23 €</td>
                        <td>73 €</td>
                        <td>165 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Sócio</th>
                        <td>26 €</td>
                        <td>93 €</td>
                        <td>173 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Não Sócio</th>
                        <td>28 €</td>
                        <td>98 €</td>
                        <td>183 €</td>
                    </tr>
                    </tbody>
                </table>
                <h3>
                    PACK AULAS 1 CRIANÇA
                </h3>
                <table class="table table-striped w-auto">
                    <thead>
                    <tr>
                        <th></th>
                        <th class="center">1 aula</th>
                        <th class="center">4 aulas</th>
                        <th class="center">10 aulas</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="table-info">
                        <th scope="row">Light Sócio</th>
                        <td>32 €</td>
                        <td>121 €</td>
                        <td>259 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Light Não Sócio</th>
                        <td>35 €</td>
                        <td>128 €</td>
                        <td>273 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Sócio</th>
                        <td>37 €</td>
                        <td>135 €</td>
                        <td>287 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">Prime Não Sócio</th>
                        <td>39 €</td>
                        <td>143 €</td>
                        <td>303 €</td>
                    </tr>
                    </tbody>
                </table>
                <div class="comments">
                    <ul>
                        <li style="text-align: left;">LIGHT - Segunda a sexta, 9h - 17h.</li>
                        <li style="text-align: left;">PRIME - Segunda a sexta, 17h - 24h / Sábados, domingos e feriados, 9h - 24h.</li>
                        <li style="text-align: left;">Os valores apresentados são por pessoa e incluem IVA à taxa legal em vigor.</li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Reservas -->
        <section id="reservas" class="wrapper style2 special">
            <div class="inner">
                <header class="major">
                    <h2>RESERVAS</h2>
                </header>
            </div>
            <div class="inner">
                <h3>
                    Para efetuares reservas no clube, segue as instruções:
                </h3>
                <img class="posterimage" src="/images/tie_sports_poster.png" alt="Connect to New Padel Chão da Fonte - Viseu">
                <!-- TABELA RESERVA DE CAMPO -->
                <table class="table table-striped w-auto">
                    <thead>
                    <tr>
                        <th></th>
                        <th class="center">1h</th>
                        <th class="center">1h30m</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr class="table-info">
                        <th scope="row">LIGHT SÓCIO</th>
                        <td>3,5 €</td>
                        <td>5,5 €</td>
                    </tr>
                    <tr class="table-info">
                        <th scope="row">LIGHT NÃO SÓCIO</th>
                        <td>4,5 €</td>
                        <td>6,5 €</td>
                    </tr>
                    <tr>
                        <th scope="row">PRIME SÓCIO</th>
                        <td>5,5 €</td>
                        <td>7,5 €</td>
                    </tr>
                    <tr>
                        <th scope="row">PRIME NÃO SÓCIO</th>
                        <td>6,5 €</td>
                        <td>8,5 €</td>
                    </tr>
                    </tbody>
                </table>
                <div class="comments">
                    <ul>
                        <li style="text-align: left;">LIGHT - Segunda a sexta, 9h - 17h.</li>
                        <li style="text-align: left;">PRIME - Segunda a sexta, 17h - 24h / Sábados, domingos e feriados, 9h - 24h.</li>
                        <li style="text-align: left;">Os valores apresentados são por pessoa e incluem IVA à taxa legal em vigor.</li>
                        <li style="text-align: left;">Deve ser considerado um mínimo de 4 pessoas por reserva de campo.</li>
                    </ul>
                </div>
            </div>
        </section>
        <!-- Patrocinadores oficiais -->
        <section id="parcerias" class="wrapper style2 special">
            <div class="inner">
                <header class="major">
                    <h2>PATROCINADORES OFICIAIS</h2>
                </header>
                <div class="partners_table">
                    <div>
                        <a target="_blank" href="https://www.remax.pt/dinamica">
                            <img src="/images/partners/oficial_remax_dinamica.svg" alt="Remax Dinâmica">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="https://www.feitonumoito.pt/">
                            <img style="width:170px" src="/images/partners/oficial_fn8_sdw.svg" alt="Feito Num Oito">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="https://instagram.com/heinekenpt">
                            <img style="width:250px" src="/images/partners/oficial_heineken.svg" alt="Heineken">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="">
                            <img style="width:170px" src="/images/partners/Porsche2.png" alt="Centro Porsche Leiria">
                        </a>
                    </div>

                </div>
                <div class="partners_table">
                    <div>
                        <a target="_blank" href="https://instagram.com/heinekenpt">
                            <img src="/images/partners/oficial_bandida.png" alt="Bandida do Pomar">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="https://www.fury.pt">
                            <img style="width:170px" src="/images/partners/oficial_fury.svg" alt="Fury">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="">
                            <img style="width:170px" src="/images/partners/oficial_obliqo.svg" alt="Obliqo">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="">
                            <img style="width:300px" src="/images/partners/CN_quintaperpita.svg" alt="Quinta da Perpita">
                        </a>
                    </div>
                </div>
                <div class="partners_table">
                    <div>
                        <a target="_blank" href="">
                            <img src="/images/partners/oficial_pirales.svg" alt="Pirales">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="">
                            <img src="/images/partners/oficial_proteu.svg" alt="Proteu">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="">
                            <img style="width:170px" src="/images/partners/Habidecor.png" alt="Abyss & Habidecor">
                        </a>
                    </div>
                    <div>
                        <a target="_blank" href="">
                            <img src="/images/partners/Protectvis.png" alt="Protectvis">
                        </a>
                    </div>
                </div>
            </div>
        </section>
        <!-- Contactos -->
        <section id="contactos" class="wrapper style2 special">
            <div class="inner">
                <header class="major">
                    <h2>CONTACTOS</h2>
                </header>
            </div>
            <div class="innernoshadow">
                <div id="contacts">
                    <p><strong>Telefone:</strong> +351910715689</p>
                    <p><strong>E-mail:</strong> <a href="mailto:geral@padelclubecf.com">geral@newpadel.pt</a></p>
                    <p>
                        <iframe class="newpadel_map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3027.37151734003!2d-7.904607284734797!3d40.64374017933935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd233730500250ad%3A0x2bf80e07e7772797!2sNew%20Padel%20Ch%C3%A3o%20da%20Fonte%20-%20Viseu!5e0!3m2!1spt-PT!2spt!4v1635858609699!5m2!1spt-PT!2spt" allowfullscreen="" loading="lazy"></iframe>
                    </p>
                </div>
            </div>
        </section>
    </div>
    <!-- Footer -->
    <footer id="footer">
        <ul class="icons">
            <li><a target="_blank" href="https://www.facebook.com/newpadelcdfviseu" class="icon brands fa-facebook-f" style="font-size: 20pt;"><span class="label">Facebook</span></a></li>
            <li><a target="_blank" href="https://www.instagram.com/newpadelcdfviseu" class="icon brands fa-instagram" style="font-size: 20pt;"><span class="label">Instagram</span></a></li>
            <li><a target="_blank" href="https://web.whatsapp.com/send?phone=00351910715689" class="icon brands fa-whatsapp" style="font-size: 20pt;"><span class="label">WhatsApp</span></a></li>

        </ul>
        <ul class="copyright">
            <li>&copy; 2025 - New Padel &reg;</li>
            <li>Design: <a href="http://html5up.net">HTML5 UP</a></li>
        </ul>
    </footer>

@endsection

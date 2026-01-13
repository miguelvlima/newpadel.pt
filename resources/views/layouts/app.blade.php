<!doctype html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>@yield('title', 'New Padel')</title>
  <link rel="canonical" href="https://www.newpadel.pt" />
  <link rel="shortcut icon" href="/images/favicon.ico" type="image/x-icon">

  <link rel="stylesheet" href="/assets/css/np-clean.css?v=1" />

  {{-- Mantém os pixels/analytics que já tens no app.blade.php --}}
  <script>
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '238976514843902');
    fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=238976514843902&ev=PageView&noscript=1"
  /></noscript>

  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-MD8BT9VV2P');
  </script>
</head>

<body>
  @yield('content')
</body>
</html>

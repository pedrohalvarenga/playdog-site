/* Play Dog — mensagem pronta do WhatsApp conforme a origem da visita + medição (dataLayer)
   Cada botão diz o serviço em data-wa (ex.: "saber da creche.") e, se quiser, um complemento em data-wa-extra.
   O começo da mensagem muda conforme de onde a pessoa veio:
     gclid/gbraid/wbraid ou utm_source=google + utm_medium=cpc  -> anúncio do Google
     msclkid ou utm_source=bing + utm_medium=cpc                -> anúncio do Bing
     utm_campaign começando com "perfil" (link do Perfil)        -> Google Maps
     utm_medium=paid_social                                       -> anúncio do Instagram
     utm_source=instagram                                         -> Instagram
     utm_source=youtube                                           -> YouTube
     utm_source=chatgpt.com ou visita vinda de ChatGPT, Perplexity, Gemini, Claude ou Copilot -> IA
     qualquer outro caso                                          -> site
   A origem da 1ª página fica guardada só no navegador, durante a visita (sessionStorage),
   e vale nas páginas seguintes. Só é trocada se a pessoa voltar por outro link marcado. */
(function () {
  'use strict';

  var FONE = '5532991651894';
  var CHAVE = 'playdog_origem';
  var PREFIXOS = {
    anuncio_google: 'Oi! Vi o anúncio da Play Dog no Google',
    anuncio_bing: 'Oi! Vi o anúncio da Play Dog no Bing',
    maps: 'Oi! Vi a Play Dog no Google Maps',
    anuncio_instagram: 'Oi! Vi o anúncio da Play Dog no Instagram',
    instagram: 'Oi! Vim pelo Instagram',
    youtube: 'Oi! Vi o vídeo da Play Dog no YouTube',
    ia: 'Oi! Uma IA me indicou a Play Dog',
    site: 'Oi! Vim pelo site da Play Dog'
  };
  var HOSTS_IA = ['chatgpt.com', 'chat.openai.com', 'openai.com', 'perplexity.ai', 'gemini.google.com', 'claude.ai', 'copilot.microsoft.com'];

  function minusc(v) { return (v || '').toString().toLowerCase(); }

  function lerParametros() {
    var out = {};
    var q = (window.location.search || '').replace(/^\?/, '');
    if (!q) return out;
    q.split('&').forEach(function (par) {
      if (!par) return;
      var i = par.indexOf('=');
      var k = i === -1 ? par : par.slice(0, i);
      var v = i === -1 ? '' : par.slice(i + 1);
      try { k = decodeURIComponent(k.replace(/\+/g, ' ')); v = decodeURIComponent(v.replace(/\+/g, ' ')); } catch (e) {}
      out[minusc(k)] = v;
    });
    return out;
  }

  function ehHostIA(host) {
    host = minusc(host).replace(/^www\./, '');
    if (!host) return false;
    for (var i = 0; i < HOSTS_IA.length; i++) {
      var h = HOSTS_IA[i];
      if (host === h || host.slice(-(h.length + 1)) === '.' + h) return true;
    }
    return false;
  }

  function detectar() {
    var p = lerParametros();
    if (p.gclid || p.gbraid || p.wbraid) return 'anuncio_google';
    if (p.msclkid) return 'anuncio_bing';
    var src = minusc(p.utm_source), med = minusc(p.utm_medium), camp = minusc(p.utm_campaign);
    if (src === 'google' && med === 'cpc') return 'anuncio_google';
    if (src === 'bing' && med === 'cpc') return 'anuncio_bing';
    if (camp.indexOf('perfil') === 0) return 'maps';
    if (med === 'paid_social') return 'anuncio_instagram';
    if (src === 'instagram' || src === 'ig') return 'instagram';
    if (src === 'youtube') return 'youtube';
    if (ehHostIA(src) || src === 'chatgpt' || src === 'perplexity' || src === 'gemini' || src === 'claude' || src === 'copilot') return 'ia';
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) { ref = ''; }
    if (ehHostIA(ref)) return 'ia';
    return 'site';
  }

  function lerSalva() { try { return window.sessionStorage.getItem(CHAVE); } catch (e) { return null; } }
  function gravar(v) { try { window.sessionStorage.setItem(CHAVE, v); } catch (e) {} }

  var origem;
  try {
    var detectada = detectar();
    var salva = lerSalva();
    if (detectada !== 'site') { origem = detectada; gravar(origem); }
    else if (salva && PREFIXOS.hasOwnProperty(salva)) { origem = salva; }
    else { origem = 'site'; gravar('site'); }
  } catch (e) { origem = 'site'; }
  window.PLAYDOG_ORIGEM = origem;

  function mensagem(el) {
    var fim = el.getAttribute('data-wa') || 'falar com a Play Dog.';
    var extra = el.getAttribute('data-wa-extra');
    return PREFIXOS[origem] + ' e quero ' + fim + (extra ? ' ' + extra : '');
  }
  function linkWa(el) { return 'https://wa.me/' + FONE + '?text=' + encodeURIComponent(mensagem(el)); }

  function atualizarLinks() {
    Array.prototype.forEach.call(document.querySelectorAll('a[data-wa]'), function (a) {
      a.setAttribute('href', linkWa(a));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', atualizarLinks);
  else atualizarLinks();

  function servicoDe(el) {
    var s = el.getAttribute('data-servico');
    if (s) return s;
    var b = document.body && document.body.getAttribute('data-servico');
    return b || 'geral';
  }

  // clique no WhatsApp ou no telefone = contato (generate_lead no dataLayer do GTM)
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var metodo = null;
    if (href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1) metodo = 'whatsapp';
    else if (href.indexOf('tel:') === 0) metodo = 'telefone';
    if (!metodo) return;
    if (metodo === 'whatsapp' && a.hasAttribute('data-wa')) a.setAttribute('href', linkWa(a));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'generate_lead',
      lead_source: metodo,
      metodo: metodo,
      cta: a.getAttribute('data-cta') || 'outro',
      servico: servicoDe(a),
      origem: origem,
      pagina: window.location.pathname
    });
  }, true);
})();

// Serve EVERYBODY DANCES under /dances/ without duplicating large 3D/audio assets.
// Updates in the original public GitHub Pages game remain visible here.
const SOURCE = 'https://djrozzo-glitch.github.io/choreo_game/';
const WORKER_API = 'https://everybody-dances-links.djrozzo.workers.dev';
export async function onRequest({request}) {
  const url = new URL(request.url);
  const prefix = '/dances';
  const suffix = url.pathname.slice(prefix.length).replace(/^\/+/, '');
  if (suffix.split('/').some(part => part === '..')) return new Response('Bad path', {status:400});
  const upstream = new URL(suffix || 'index.html', SOURCE);
  upstream.search = url.search;
  const result = await fetch(upstream.toString(), {redirect:'follow'});
  if (!result.ok) return new Response('Dance resource unavailable', {status:result.status});
  const headers = new Headers(result.headers);
  headers.delete('set-cookie');
  headers.delete('content-security-policy');
  headers.set('Cache-Control', suffix && !suffix.endsWith('.html') ? 'public, max-age=300' : 'no-cache');
  if (!suffix || suffix === 'index.html') {
    let html = await result.text();
    html = html.replace("const DANCE_API_BASE='"+WORKER_API+"';", "const DANCE_API_BASE=location.origin;");
    if (!html.includes('property="og:title"')) html = html.replace('</head>', "<meta name=\"description\" content=\"Create a contemporary dance, watch your choreography come alive, and share your performance with friends.\"><meta property=\"og:type\" content=\"website\"><meta property=\"og:site_name\" content=\"EVERYBODY DANCES\"><meta property=\"og:title\" content=\"EVERYBODY DANCES — Create a dance\"><meta property=\"og:description\" content=\"One body. Infinite questionable decisions. Create, perform and share your own contemporary dance.\"><meta property=\"og:image\" content=\"https://weirdflex.online/assets/dances-og.svg\"><meta property=\"og:image:alt\" content=\"EVERYBODY DANCES — contemporary dance game\"><meta name=\"twitter:card\" content=\"summary_large_image\">"+'</head>');
    headers.delete('content-length');
    headers.set('Content-Type','text/html; charset=utf-8');
    return new Response(html,{status:200,headers});
  }
  return new Response(result.body,{status:result.status,headers});
}

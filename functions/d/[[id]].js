// Return a crawler-friendly social card while redirecting real visitors to playback.
const IMAGE='https://weirdflex.online/dances/assets/branding/social-preview-1200x630.png';
function esc(s){return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
export async function onRequestGet({request}) {
  const url=new URL(request.url);
  const id=url.pathname.slice('/d/'.length);
  if(!/^[A-Za-z0-9_-]{8,16}$/.test(id))return new Response('Invalid dance link',{status:400});
  const destination=url.origin+'/dances/?dance='+encodeURIComponent(id)+'&api='+encodeURIComponent(url.origin);
  const ua=request.headers.get('user-agent')||'';
  const crawler=/facebookexternalhit|Facebot|Twitterbot|Slackbot|Discordbot|TelegramBot|WhatsApp|LinkedInBot|Pinterest|Googlebot|bingbot/i.test(ua);
  if(!crawler)return Response.redirect(destination,302);
  const title='Watch a dance — EVERYBODY DANCES';
  const description='A contemporary dance created in EVERYBODY DANCES. Watch the performance and make your own.';
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><title>'+title+'</title><meta name="description" content="'+description+'"><meta property="og:type" content="website"><meta property="og:site_name" content="EVERYBODY DANCES"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+description+'"><meta property="og:url" content="'+esc(url.href)+'"><meta property="og:image" content="'+IMAGE+'"><meta name="twitter:card" content="summary_large_image"><meta http-equiv="refresh" content="0;url='+esc(destination)+'"></head><body><a href="'+esc(destination)+'">Watch this dance</a></body></html>';
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300','X-Robots-Tag':'noindex'}});
}

// Same-origin API bridge to the existing Cloudflare Worker/KV namespace.
// No additional KV binding is needed on the Cloudflare Pages project.
const BACKEND='https://everybody-dances-links.djrozzo.workers.dev';
const LEGACY_ORIGIN='https://djrozzo-glitch.github.io';
export async function onRequest({request}) {
  const url=new URL(request.url);
  const suffix=url.pathname.slice('/api/dances'.length);
  if(request.method!=='GET'&&request.method!=='POST')return new Response('Method not allowed',{status:405});
  if(request.method==='POST'&&suffix!=='')return new Response('Not found',{status:404});
  if(request.method==='GET'&&!/^\/[A-Za-z0-9_-]{8,16}$/.test(suffix))return new Response('Not found',{status:404});
  const upstream=await fetch(BACKEND+'/api/dances'+suffix,{
    method:request.method,
    headers:{'Origin':LEGACY_ORIGIN,'Content-Type':'application/json'},
    body:request.method==='POST'?request.body:undefined,
    redirect:'manual'
  });
  const headers=new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  if(request.method==='POST'&&upstream.ok){
    const data=await upstream.json();
    if(data.id&&/^[A-Za-z0-9_-]{8,16}$/.test(data.id))data.url=url.origin+'/d/'+data.id;
    return new Response(JSON.stringify(data),{status:upstream.status,headers});
  }
  return new Response(upstream.body,{status:upstream.status,headers});
}

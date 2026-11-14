// Branded short links, preserving the existing Worker and KV records.
export async function onRequestGet({request}) {
  const url=new URL(request.url);
  const id=url.pathname.slice('/d/'.length);
  if(!/^[A-Za-z0-9_-]{8,16}$/.test(id))return new Response('Invalid dance link',{status:400});
  return Response.redirect(url.origin+'/dances/?dance='+encodeURIComponent(id)+'&api='+encodeURIComponent(url.origin),302);
}

/* Choosing a poster on Wikipedia — the one rule, shared.
   Part of The Passage — see ui-passage-pull.html.

   This file has no imports on purpose. The page uses it as a fallback
   when a title has no local art, and tools/fetch-posters.mjs uses it
   from Node to build the local set in the first place. If the two ever
   disagreed about which article is "the film", the poster you saw in
   the browser would not be the one the tool saved for you. */

/* the search that asks for several candidates and their lead images */
export function searchUrl(key,year){
  const q=encodeURIComponent(`${key} ${year||''} film`);
  return 'https://en.wikipedia.org/w/api.php?action=query&format=json'
    +'&origin=*&prop=pageimages&piprop=thumbnail&pilicense=any&pithumbsize=500'
    +'&generator=search&gsrlimit=6&gsrnamespace=0&gsrsearch='+q;
}

/* Pick by what the article IS. An exact title wins, then the
   year-qualified film article, then any "(… film)". A series, a
   franchise, a soundtrack, a disambiguation page or a television
   article is never the one-sheet, whatever the search thinks — which
   is how a Meet the Parents case once showed "The Biggest Focker
   Collection Ever", the page image of the film-SERIES article.

   Note also that Object.values() on the API's pages object comes back
   in PAGE ID order, not search order, so the ranking is read off each
   page's own index rather than assumed. The wrong KIND of article is
   thrown out entirely; among what is left, title affinity decides and
   search rank breaks ties. A film whose article is not named after it
   — Disney's The Kid, say — still wins on rank alone, which an outright
   "must look like the title" rule would have thrown away. */
const BAD=/\((?:film series|franchise|soundtrack|disambiguation|TV series|television series|video game|novel|book)\)/i;
export function pickPoster(pages,key,year){
  const want=(key||'').toLowerCase();
  const rank=pg=>{
    const name=(pg.title||'').toLowerCase();
    if(BAD.test(pg.title||'')) return 90;
    if(name===want) return 0;
    if(name===`${want} (${year||''} film)`) return 1;
    if(/\(\d{4} film\)$/.test(name)&&name.startsWith(want+' (')) return 2;
    if(name===`${want} (film)`) return 3;
    if(name.startsWith(want+' (')) return 4;
    if(name.startsWith(want)) return 5;
    return 20;
  };
  const pick=(pages||[])
    .filter(pg=>pg.thumbnail&&pg.thumbnail.source&&!BAD.test(pg.title||''))
    .sort((a,b)=>rank(a)-rank(b)||(a.index||99)-(b.index||99))[0];
  return pick?{url:pick.thumbnail.source,article:pick.title}:null;
}

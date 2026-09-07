/* ================================================================
   WHAT ELSE WAS PLAYING

   The stubs in the shoebox are only the films you actually went to.
   The poster cases on the wall should show the rest of the marquee —
   the pictures that were out at the same time. This is a hand-kept
   list of wide releases, month-accurate where it matters, used to
   fill the frames around whichever stub is in your hand.

   Nothing here is a real poster image: each one is drawn as a
   one-sheet from the title, so there is no artwork to license and a
   film needs no asset to appear. Add a line, get a poster.

   NOTE: 2026 entries are scheduled dates and move around.
================================================================ */

const RAW=`
1999-03|The Matrix;1999-05|Star Wars: The Phantom Menace;1999-05|The Mummy
1999-06|Big Daddy;1999-06|Tarzan;1999-07|The Blair Witch Project
1999-08|The Sixth Sense;1999-09|American Beauty;1999-10|Fight Club
1999-10|Being John Malkovich;1999-11|Toy Story 2;1999-12|The Green Mile
2000-03|Erin Brockovich;2000-03|The Road to El Dorado;2000-05|Gladiator
2000-05|Mission: Impossible 2;2000-06|Chicken Run;2000-06|The Perfect Storm
2000-07|X-Men;2000-09|Almost Famous;2000-09|Memento;2000-10|Meet the Parents
2000-11|Unbreakable;2000-12|Cast Away;2000-12|Crouching Tiger, Hidden Dragon
2001-05|Shrek;2001-05|The Mummy Returns;2001-05|Pearl Harbor;2001-05|Moulin Rouge!
2001-07|Legally Blonde;2001-07|Planet of the Apes;2001-08|Rush Hour 2
2001-09|Zoolander;2001-10|Training Day;2001-10|Bandits
2001-11|Harry Potter and the Sorcerer's Stone;2001-11|Monsters, Inc.;2001-11|Spy Game
2001-12|The Lord of the Rings: The Fellowship of the Ring;2001-12|Ocean's Eleven
2001-12|A Beautiful Mind;2001-12|Vanilla Sky;2001-12|Black Hawk Down
2002-03|Ice Age;2002-04|My Big Fat Greek Wedding;2002-05|Spider-Man
2002-05|Star Wars: Attack of the Clones;2002-06|Minority Report;2002-07|Men in Black II
2002-07|Road to Perdition;2002-08|Signs;2002-10|The Ring;2002-11|8 Mile
2002-12|The Lord of the Rings: The Two Towers;2002-12|Catch Me If You Can;2002-12|Chicago
2003-02|Old School;2003-05|Finding Nemo;2003-05|The Matrix Reloaded;2003-05|X2
2003-05|Bruce Almighty;2003-07|Pirates of the Caribbean: The Curse of the Black Pearl
2003-07|Terminator 3: Rise of the Machines;2003-07|Bad Boys II
2003-07|Lara Croft Tomb Raider: The Cradle of Life;2003-08|Freaky Friday
2003-09|Lost in Translation;2003-10|Kill Bill: Volume 1;2003-10|School of Rock
2003-10|Radio;2003-11|Elf;2003-12|The Lord of the Rings: The Return of the King
2004-02|The Passion of the Christ;2004-03|Eternal Sunshine of the Spotless Mind
2004-04|Mean Girls;2004-05|Shrek 2;2004-06|Spider-Man 2;2004-06|Dodgeball
2004-06|Harry Potter and the Prisoner of Azkaban;2004-06|Napoleon Dynamite
2004-07|Anchorman;2004-07|The Bourne Supremacy;2004-11|The Incredibles
2004-11|National Treasure;2004-12|Ocean's Twelve
2005-02|Hitch;2005-04|Sin City;2005-05|Star Wars: Revenge of the Sith
2005-06|Batman Begins;2005-06|War of the Worlds;2005-06|Mr. & Mrs. Smith
2005-07|Charlie and the Chocolate Factory;2005-07|Wedding Crashers
2005-08|The 40-Year-Old Virgin;2005-11|Harry Potter and the Goblet of Fire
2005-11|Walk the Line;2005-12|King Kong;2005-12|The Chronicles of Narnia
2006-05|X-Men: The Last Stand;2006-05|Mission: Impossible III;2006-06|Cars
2006-06|Superman Returns;2006-06|The Devil Wears Prada
2006-07|Pirates of the Caribbean: Dead Man's Chest;2006-07|Little Miss Sunshine
2006-08|Talladega Nights;2006-10|The Departed;2006-11|Casino Royale
2006-11|Borat;2006-11|Happy Feet;2006-12|Night at the Museum
2007-03|300;2007-05|Spider-Man 3;2007-05|Pirates of the Caribbean: At World's End
2007-06|Ratatouille;2007-06|Knocked Up;2007-07|Transformers
2007-07|Harry Potter and the Order of the Phoenix;2007-08|Superbad
2007-08|The Bourne Ultimatum;2007-11|No Country for Old Men;2007-11|Enchanted
2007-12|I Am Legend;2007-12|Juno;2007-12|National Treasure: Book of Secrets
2008-05|Iron Man;2008-05|Indiana Jones and the Kingdom of the Crystal Skull
2008-06|WALL-E;2008-06|Kung Fu Panda;2008-06|Wanted;2008-07|The Dark Knight
2008-07|Hancock;2008-08|Tropic Thunder;2008-11|Twilight;2008-11|Quantum of Solace
2008-11|Slumdog Millionaire;2008-12|Gran Torino
2009-05|Star Trek;2009-05|Up;2009-06|The Hangover
2009-06|Transformers: Revenge of the Fallen;2009-07|Harry Potter and the Half-Blood Prince
2009-08|Inglourious Basterds;2009-08|District 9;2009-10|Zombieland
2009-11|The Blind Side;2009-11|2012;2009-12|Avatar;2009-12|Sherlock Holmes
2010-02|Shutter Island;2010-03|Alice in Wonderland;2010-03|How to Train Your Dragon
2010-05|Iron Man 2;2010-06|Toy Story 3;2010-07|Inception;2010-07|Despicable Me
2010-10|The Social Network;2010-11|Harry Potter and the Deathly Hallows: Part 1
2010-11|Tangled;2010-11|The King's Speech;2010-12|True Grit;2010-12|Black Swan
2011-05|Thor;2011-05|Bridesmaids;2011-05|The Hangover Part II
2011-05|Pirates of the Caribbean: On Stranger Tides;2011-06|X-Men: First Class
2011-06|Transformers: Dark of the Moon;2011-07|Captain America: The First Avenger
2011-07|Harry Potter and the Deathly Hallows: Part 2;2011-08|Rise of the Planet of the Apes
2011-08|The Help;2011-09|Moneyball;2011-12|Mission: Impossible – Ghost Protocol
2011-12|The Girl with the Dragon Tattoo
2012-03|The Hunger Games;2012-05|The Avengers;2012-06|Prometheus;2012-06|Brave
2012-06|Ted;2012-07|The Dark Knight Rises;2012-09|Looper;2012-10|Argo
2012-11|Skyfall;2012-11|Wreck-It Ralph;2012-11|Lincoln;2012-11|Life of Pi
2012-11|Flight;2012-12|The Hobbit: An Unexpected Journey;2012-12|Django Unchained
2012-12|Les Misérables
2013-01|Mama;2013-01|Texas Chainsaw 3D;2013-03|Oz the Great and Powerful
2013-04|Trance;2013-04|Oblivion;2013-05|Iron Man 3;2013-05|The Great Gatsby
2013-05|Now You See Me;2013-06|Man of Steel;2013-06|World War Z
2013-06|Monsters University;2013-06|This Is the End;2013-07|Pacific Rim
2013-07|Despicable Me 2;2013-10|Gravity;2013-10|12 Years a Slave
2013-11|Frozen;2013-11|Thor: The Dark World;2013-11|The Hunger Games: Catching Fire
2013-12|The Wolf of Wall Street;2013-12|American Hustle;2013-12|Anchorman 2
2014-02|The Lego Movie;2014-04|Captain America: The Winter Soldier
2014-05|X-Men: Days of Future Past;2014-05|Godzilla;2014-06|Edge of Tomorrow
2014-07|Dawn of the Planet of the Apes;2014-08|Guardians of the Galaxy
2014-10|Gone Girl;2014-10|Birdman;2014-10|Whiplash;2014-11|Interstellar
2014-11|Big Hero 6;2014-12|The Hobbit: The Battle of the Five Armies
2015-05|Avengers: Age of Ultron;2015-05|Mad Max: Fury Road;2015-06|Jurassic World
2015-06|Inside Out;2015-07|Ant-Man;2015-07|Mission: Impossible – Rogue Nation
2015-08|Straight Outta Compton;2015-10|The Martian;2015-11|Spectre
2015-11|Creed;2015-11|Spotlight;2015-12|Star Wars: The Force Awakens
2015-12|The Revenant
2016-02|Deadpool;2016-03|Zootopia;2016-05|Captain America: Civil War
2016-06|Finding Dory;2016-08|Suicide Squad;2016-11|Doctor Strange;2016-11|Moana
2016-11|Arrival;2016-11|Fantastic Beasts and Where to Find Them
2016-12|Rogue One: A Star Wars Story;2016-12|La La Land;2016-12|Sing
2016-12|Hidden Figures
2017-02|Get Out;2017-03|Logan;2017-03|Beauty and the Beast
2017-05|Guardians of the Galaxy Vol. 2;2017-06|Wonder Woman
2017-07|Spider-Man: Homecoming;2017-07|Dunkirk;2017-09|It
2017-10|Blade Runner 2049;2017-11|Thor: Ragnarok;2017-11|Coco;2017-11|Lady Bird
2017-12|Star Wars: The Last Jedi;2017-12|The Greatest Showman
2018-02|Black Panther;2018-03|Ready Player One;2018-04|A Quiet Place
2018-04|Avengers: Infinity War;2018-05|Deadpool 2;2018-06|Incredibles 2
2018-06|Jurassic World: Fallen Kingdom;2018-07|Mission: Impossible – Fallout
2018-10|A Star Is Born;2018-11|Bohemian Rhapsody;2018-11|Green Book
2018-12|Aquaman;2018-12|Spider-Man: Into the Spider-Verse;2018-12|Roma
2019-03|Captain Marvel;2019-04|Avengers: Endgame;2019-06|Toy Story 4
2019-07|Spider-Man: Far From Home;2019-07|The Lion King
2019-07|Once Upon a Time in Hollywood;2019-09|It Chapter Two;2019-10|Joker
2019-10|Parasite;2019-11|Frozen II;2019-11|Ford v Ferrari;2019-11|Knives Out
2019-12|Star Wars: The Rise of Skywalker;2019-12|1917
2020-01|Bad Boys for Life;2020-02|Sonic the Hedgehog;2020-02|Birds of Prey
2020-02|The Invisible Man;2020-03|Onward;2020-08|Tenet;2020-09|Mulan
2020-12|Soul;2020-12|Wonder Woman 1984;2020-12|Nomadland
2021-05|A Quiet Place Part II;2021-06|F9;2021-07|Black Widow;2021-08|Free Guy
2021-08|The Suicide Squad;2021-09|Shang-Chi and the Legend of the Ten Rings
2021-10|Dune;2021-10|No Time to Die;2021-10|Venom: Let There Be Carnage
2021-11|Eternals;2021-11|Ghostbusters: Afterlife;2021-11|Encanto
2021-12|Spider-Man: No Way Home;2021-12|West Side Story
2022-03|The Batman;2022-03|Everything Everywhere All at Once
2022-05|Doctor Strange in the Multiverse of Madness;2022-05|Top Gun: Maverick
2022-06|Jurassic World Dominion;2022-06|Elvis;2022-07|Thor: Love and Thunder
2022-07|Minions: The Rise of Gru;2022-07|Nope;2022-11|Black Panther: Wakanda Forever
2022-11|The Fabelmans;2022-12|Avatar: The Way of Water;2022-12|Glass Onion
2023-03|John Wick: Chapter 4;2023-04|The Super Mario Bros. Movie
2023-05|Guardians of the Galaxy Vol. 3;2023-06|Spider-Man: Across the Spider-Verse
2023-06|Elemental;2023-07|Barbie;2023-07|Oppenheimer
2023-07|Mission: Impossible – Dead Reckoning;2023-10|Killers of the Flower Moon
2023-11|The Marvels;2023-11|Napoleon;2023-12|Wonka;2023-12|Poor Things
2024-03|Dune: Part Two;2024-03|Godzilla x Kong: The New Empire
2024-06|Inside Out 2;2024-06|A Quiet Place: Day One;2024-07|Despicable Me 4
2024-07|Twisters;2024-07|Deadpool & Wolverine;2024-09|Beetlejuice Beetlejuice
2024-09|The Wild Robot;2024-10|Anora;2024-11|Wicked;2024-11|Moana 2
2024-11|Gladiator II;2024-12|Sonic the Hedgehog 3;2024-12|Nosferatu
2025-02|Captain America: Brave New World;2025-03|Snow White;2025-05|Thunderbolts
2025-05|Mission: Impossible – The Final Reckoning;2025-05|Lilo & Stitch
2025-06|How to Train Your Dragon;2025-06|F1;2025-07|Jurassic World Rebirth
2025-07|Superman;2025-07|The Fantastic Four: First Steps
2025-11|Wicked: For Good;2025-11|Zootopia 2;2025-12|Avatar: Fire and Ash
2026-04|The Super Mario Galaxy Movie;2026-05|The Mandalorian and Grogu
2026-06|Toy Story 5;2026-06|Supergirl;2026-07|Moana;2026-07|Minions 3
2026-12|Dune: Part Three
`;

export const FILMS=RAW.trim().split(/[\n;]/).map(s=>s.trim()).filter(Boolean)
  .map(s=>{const i=s.indexOf('|');return {d:s.slice(0,i),t:s.slice(i+1)};});

const asMonths=d=>{
  if(!d) return 0;
  const p=String(d).split('-');
  return (+p[0])*12+(+(p[1]||6)-1);
};

/* films out around this date, nearest first, skipping the one in hand */
export function nearbyFilms(date,n,skipTitle){
  const at=asMonths(date);
  const skip=(skipTitle||'').toLowerCase();
  return FILMS
    .filter(f=>f.t.toLowerCase()!==skip)
    .map(f=>({f,gap:Math.abs(asMonths(f.d)-at)}))
    .sort((a,b)=>a.gap-b.gap)
    .slice(0,n)
    .map(x=>x.f);
}

/* ---------------- the one-sheet ----------------
   Drawn, not licensed. Palette is seeded off the title so a film
   always gets the same poster. */
const CACHE=new Map();
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

const SCHEMES=[
  ['#141b2e','#e8d9b8','#c9452f'],['#1d1410','#f2e4c6','#d8a24a'],
  ['#0f2320','#e6efe6','#45c9a0'],['#26101c','#f4e2ee','#d2417f'],
  ['#101a24','#dfeaf2','#3f9fd8'],['#241a08','#f6ead0','#e0a72c'],
  ['#1a1a1a','#ecece8','#b5231f'],['#182016','#e9f0dc','#8fbf4a'],
];

export function posterCanvas(title,date){
  const key=title+'|'+date;
  if(CACHE.has(key)) return CACHE.get(key);
  const W=360,H=540;
  const c=document.createElement('canvas'); c.width=W; c.height=H;
  const g=c.getContext('2d');
  const h=hash(title), sc=SCHEMES[h%SCHEMES.length];
  const [bg,ink,accent]=sc;

  g.fillStyle=bg; g.fillRect(0,0,W,H);
  /* a graphic device, chosen off the hash so posters differ */
  const kind=(h>>3)%4;
  g.save();
  if(kind===0){
    const r=g.createRadialGradient(W/2,H*.38,10,W/2,H*.38,W*.7);
    r.addColorStop(0,accent); r.addColorStop(1,bg);
    g.globalAlpha=.55; g.fillStyle=r; g.fillRect(0,0,W,H);
  }else if(kind===1){
    g.globalAlpha=.5; g.fillStyle=accent;
    for(let i=0;i<7;i++) g.fillRect(0,H*.12+i*26,W,9);
  }else if(kind===2){
    g.globalAlpha=.55; g.fillStyle=accent;
    g.beginPath(); g.arc(W/2,H*.36,W*.29,0,Math.PI*2); g.fill();
  }else{
    g.globalAlpha=.5; g.fillStyle=accent;
    g.beginPath(); g.moveTo(0,H*.62); g.lineTo(W,H*.44); g.lineTo(W,H*.72); g.lineTo(0,H*.86);
    g.closePath(); g.fill();
  }
  g.restore();

  /* Title, wrapped and fitted. Both constraints matter: the longest
     single word has to fit the width (THUNDERBOLTS can't wrap), and the
     whole block has to sit inside the band above the credits (MISSION:
     IMPOSSIBLE – THE FINAL RECKONING wants five lines). Shrink until
     both hold, then stand the block on the bottom of the band the way
     a one-sheet does. */
  const words=title.toUpperCase().split(' ');
  const maxW=W-56, bandTop=H*.42, bandBot=H-132;
  let size=52, lines=[], lineH=0;
  const fit=()=>{
    g.font=`600 ${size}px Oswald, sans-serif`;
    lines=[]; let cur='';
    for(const w of words){
      const test=cur?cur+' '+w:w;
      if(g.measureText(test).width>maxW&&cur){lines.push(cur);cur=w;}else cur=test;
    }
    if(cur) lines.push(cur);
    lineH=size*1.06;
    const widest=lines.reduce((m,l)=>Math.max(m,g.measureText(l).width),0);
    return widest<=maxW && lines.length*lineH<=bandBot-bandTop;
  };
  while(size>11&&!fit()) size-=2;
  g.textAlign='center'; g.fillStyle=ink;
  const startY=bandBot-(lines.length-1)*lineH;
  lines.forEach((ln,i)=>g.fillText(ln,W/2,startY+i*lineH));

  /* credit block + date, the way a one-sheet carries them */
  g.fillStyle=ink; g.globalAlpha=.45;
  for(let i=0;i<5;i++){
    const w=W*(.5-i*.05), x=(W-w)/2;
    g.fillRect(x,H-92+i*11,w,3.5);
  }
  g.globalAlpha=1;
  g.fillStyle=accent; g.font='700 17px "Space Mono", monospace';
  const yr=(date||'').slice(0,4);
  g.fillText(yr?`— ${yr} —`:'', W/2, H-104);

  /* printed paper: a little age and a vignette */
  for(let i=0;i<26;i++){
    const x=Math.random()*W,y=Math.random()*H,r=8+Math.random()*40;
    const rg=g.createRadialGradient(x,y,0,x,y,r);
    rg.addColorStop(0,'rgba(120,100,70,.05)'); rg.addColorStop(1,'rgba(120,100,70,0)');
    g.fillStyle=rg; g.fillRect(x-r,y-r,r*2,r*2);
  }
  const vg=g.createRadialGradient(W/2,H/2,H*.28,W/2,H/2,H*.72);
  vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.34)');
  g.fillStyle=vg; g.fillRect(0,0,W,H);

  CACHE.set(key,c);
  return c;
}

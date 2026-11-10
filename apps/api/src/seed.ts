import mongoose, { Types } from 'mongoose';
import { PersonSchema } from './people/person.schema';
import { SiteSchema } from './sites/site.schema';
import { VisitSchema, VisitMethod } from './visits/visit.schema';
import { htmlToSearchText, sanitizeSiteHtml } from './sanitize';
import { resolveMongoUri } from './mongo';

const uri = resolveMongoUri();

type SeedSite = {
  address: string;
  title: string;
  author: string;
  html: string;
};

const PEOPLE: { name: string; isAuthor: boolean }[] = [
  { name: 'Mira Vale', isAuthor: true },
  { name: 'Jonah Kite', isAuthor: true },
  { name: 'Ada Rook', isAuthor: true },
  { name: 'Sam Lin', isAuthor: false },
  { name: 'Riven Moss', isAuthor: false },
];

function page(title: string, body: string): string {
  return `<article><h1>${title}</h1>${body}</article>`;
}

const SITES: SeedSite[] = [
  {
    address: 'tidepool.zz',
    title: 'Tidepool Notes',
    author: 'Mira Vale',
    html: page(
      'Tidepool Notes',
      `<p>The water here remembers every footstep. Start at the <a href="lighthouse.zz">lighthouse</a>, then drift to the <a href="market.zz">night market</a>.</p>
       <p>If you are brave, try <a href="ghost.harbor.zz">ghost.harbor.zz</a> — nobody has ever published there.</p>`,
    ),
  },
  {
    address: 'lighthouse.zz',
    title: 'Lighthouse Keep',
    author: 'Mira Vale',
    html: page(
      'Lighthouse Keep',
      `<p>Three flashes mean fog. One long beam means come home. Mira keeps the log beside the <a href="signal.zz">signal book</a>.</p>
       <p>Downstream is the <a href="ferry.zz">ferry timetable</a>.</p>`,
    ),
  },
  {
    address: 'market.zz',
    title: 'Night Market',
    author: 'Jonah Kite',
    html: page(
      'Night Market',
      `<p>Copper bowls, warm bread, and gossip about the <a href="orchard.zz">orchard</a>. Jonah swears the best rumor stall sits next to <a href="archive.zz">the archive</a>.</p>
       <p>Broken tip: visit <a href="neverbuilt.zz">neverbuilt.zz</a>.</p>`,
    ),
  },
  {
    address: 'orchard.zz',
    title: 'Wind Orchard',
    author: 'Jonah Kite',
    html: page(
      'Wind Orchard',
      `<p>Apples that taste like rain. Paths loop back to <a href="tidepool.zz">tidepool.zz</a> and forward to <a href="workshop.zz">workshop.zz</a>.</p>`,
    ),
  },
  {
    address: 'archive.zz',
    title: 'Quiet Archive',
    author: 'Ada Rook',
    html: page(
      'Quiet Archive',
      `<p>Catalog cards smell of dust and lemon oil. Cross-reference <a href="signal.zz">signal.zz</a>, then the <a href="atlas.zz">small atlas</a>.</p>
       <p>Ada also left a note about <a href="missing.index.zz">missing.index.zz</a>.</p>`,
    ),
  },
  {
    address: 'signal.zz',
    title: 'Signal Book',
    author: 'Ada Rook',
    html: page(
      'Signal Book',
      `<p>Flags, lamps, and codes between the keep and the market. See also <a href="lighthouse.zz">lighthouse.zz</a> and <a href="ferry.zz">ferry.zz</a>.</p>`,
    ),
  },
  {
    address: 'ferry.zz',
    title: 'Ferry Timetable',
    author: 'Mira Vale',
    html: page(
      'Ferry Timetable',
      `<p>Departures every hour until the fog horn. Tickets sold near <a href="market.zz">market.zz</a>. Last stop: <a href="workshop.zz">workshop.zz</a>.</p>`,
    ),
  },
  {
    address: 'workshop.zz',
    title: 'Tin Workshop',
    author: 'Jonah Kite',
    html: page(
      'Tin Workshop',
      `<p>Bent nails and bright ideas. Jonah files sketches for the <a href="atlas.zz">atlas</a> and sends scraps back to <a href="orchard.zz">orchard.zz</a>.</p>`,
    ),
  },
  {
    address: 'atlas.zz',
    title: 'Small Atlas',
    author: 'Ada Rook',
    html: page(
      'Small Atlas',
      `<p>Every address drawn by hand. From here you can reach <a href="tidepool.zz">tidepool</a>, <a href="archive.zz">archive</a>, or the unfinished <a href="void.zz">void.zz</a>.</p>`,
    ),
  },
  {
    address: 'garden.zz',
    title: 'Glass Garden',
    author: 'Ada Rook',
    html: page(
      'Glass Garden',
      `<p>Ferns under clear roofs. Sit, then wander to <a href="tidepool.zz">tidepool.zz</a> or read the <a href="signal.zz">signal book</a> again.</p>`,
    ),
  },
];

/** Deterministic ~1 hour of browsing across people. */
function buildHistory(
  people: Record<string, Types.ObjectId>,
  sites: Record<string, { title: string; html: string }>,
): {
  person: Types.ObjectId;
  address: string;
  title: string;
  method: VisitMethod;
  found: boolean;
  htmlSnapshot: string;
  visitedAt: Date;
}[] {
  const start = new Date('2026-03-01T10:00:00.000Z');
  const trails: { who: string; steps: { address: string; method: VisitMethod }[] }[] = [
    {
      who: 'Sam Lin',
      steps: [
        { address: 'tidepool.zz', method: 'typed' },
        { address: 'lighthouse.zz', method: 'link' },
        { address: 'signal.zz', method: 'link' },
        { address: 'ferry.zz', method: 'link' },
        { address: 'market.zz', method: 'link' },
        { address: 'neverbuilt.zz', method: 'link' },
        { address: 'market.zz', method: 'back' },
        { address: 'orchard.zz', method: 'link' },
        { address: 'workshop.zz', method: 'link' },
        { address: 'atlas.zz', method: 'link' },
        { address: 'tidepool.zz', method: 'typed' },
        { address: 'garden.zz', method: 'typed' },
      ],
    },
    {
      who: 'Riven Moss',
      steps: [
        { address: 'archive.zz', method: 'typed' },
        { address: 'signal.zz', method: 'link' },
        { address: 'lighthouse.zz', method: 'link' },
        { address: 'tidepool.zz', method: 'link' },
        { address: 'ghost.harbor.zz', method: 'link' },
        { address: 'tidepool.zz', method: 'back' },
        { address: 'market.zz', method: 'typed' },
      ],
    },
    {
      who: 'Mira Vale',
      steps: [
        { address: 'lighthouse.zz', method: 'typed' },
        { address: 'ferry.zz', method: 'link' },
        { address: 'workshop.zz', method: 'link' },
        { address: 'atlas.zz', method: 'link' },
        { address: 'void.zz', method: 'link' },
      ],
    },
    {
      who: 'Jonah Kite',
      steps: [
        { address: 'market.zz', method: 'typed' },
        { address: 'orchard.zz', method: 'link' },
        { address: 'workshop.zz', method: 'link' },
        { address: 'market.zz', method: 'typed' },
      ],
    },
    {
      who: 'Ada Rook',
      steps: [
        { address: 'archive.zz', method: 'typed' },
        { address: 'atlas.zz', method: 'link' },
        { address: 'garden.zz', method: 'typed' },
        { address: 'signal.zz', method: 'typed' },
        { address: 'archive.zz', method: 'history' },
      ],
    },
  ];

  const out: ReturnType<typeof buildHistory> = [];
  let minute = 0;
  for (const trail of trails) {
    for (const step of trail.steps) {
      const site = sites[step.address];
      const found = Boolean(site);
      out.push({
        person: people[trail.who],
        address: step.address,
        title: site?.title ?? '',
        method: step.method,
        found,
        htmlSnapshot: site?.html ?? '',
        visitedAt: new Date(start.getTime() + minute * 60_000),
      });
      minute += 3;
    }
  }
  return out;
}

async function seed() {
  console.log(`Connecting to ${uri}`);
  await mongoose.connect(uri);

  const Person = mongoose.model('Person', PersonSchema);
  const Site = mongoose.model('Site', SiteSchema);
  const Visit = mongoose.model('Visit', VisitSchema);

  // Idempotent: clear collections, then insert deterministic data.
  await Promise.all([Person.deleteMany({}), Site.deleteMany({}), Visit.deleteMany({})]);

  const peopleDocs = await Person.insertMany(PEOPLE);
  const byName: Record<string, Types.ObjectId> = {};
  for (const p of peopleDocs) byName[p.name] = p._id as Types.ObjectId;

  const siteDocs: {
    address: string;
    title: string;
    html: string;
    text: string;
    author: Types.ObjectId;
  }[] = [];
  const siteMap: Record<string, { title: string; html: string }> = {};
  for (const s of SITES) {
    const html = sanitizeSiteHtml(s.html);
    const text = htmlToSearchText(html);
    siteDocs.push({
      address: s.address,
      title: s.title,
      html,
      text,
      author: byName[s.author],
    });
    siteMap[s.address] = { title: s.title, html };
  }
  await Site.insertMany(siteDocs);
  await Site.collection.createIndex({ text: 'text', title: 'text', address: 'text' });

  const visits = buildHistory(byName, siteMap);
  await Visit.insertMany(visits);

  console.log(`Seeded ${peopleDocs.length} people, ${siteDocs.length} sites, ${visits.length} visits.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

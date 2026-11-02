import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'images');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const WIKI_API = 'https://stealabr.fandom.com/api.php';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const CATEGORIES = [
  { name: 'Common', category: 'Category:Common_Brainrots' },
  { name: 'Rare', category: 'Category:Rare_Brainrots' },
  { name: 'Epic', category: 'Category:Epic_Brainrots' },
  { name: 'Legendary', category: 'Category:Legendary_Brainrots' },
  { name: 'Mythic', category: 'Category:Mythic_Brainrots' },
  { name: 'Secret', category: 'Category:Secret_Brainrots' },
  { name: 'OG', category: 'Category:OG_Brainrots' },
  { name: 'Brainrot God', category: 'Category:Brainrot_God' }
];

// Helper to delay
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return await res.json();
}

async function getCategoryMembers(category) {
  const url = `${WIKI_API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent(category)}&cmlimit=60&format=json`;
  try {
    const data = await fetchJson(url);
    return (data.query?.categorymembers || [])
      .map(m => m.title)
      .filter(t => !t.includes(':') && !t.includes('(Disambiguation)'));
  } catch (err) {
    console.error(`Error fetching category ${category}:`, err.message);
    return [];
  }
}

function determineTraits(title, wikitext) {
  const lowerTitle = title.toLowerCase();
  const lowerWiki = (wikitext || '').toLowerCase();
  const combined = `${lowerTitle} ${lowerWiki}`;

  // Animal detection
  const isAnimal = /cat|gato|cane|dog|puppy|dino|crocodilo|bear|bearo|gorilla|monkey|chimpanzee|shark|tubarao|fish|pesce|frog|frogo|rat|topo|fox|volpe|elefant|elephant|platypus|platypio|pig|pork|maiale|rabbit|coniglio|axolotl|axolito|lion|leone|tiger|tigre|spider|ragno|spyder|horse|cavallo|cow|mucca|goat|capra|antilop|bird|uccello|guffo|owl|duck|anatra|penguin|pinguino/.test(combined);

  // Food detection
  const isFood = /pizza|crostini|cheese|formaggio|taco|burrito|bobritto|melon|watermelon|avocado|avocadini|banana|bananito|strawberry|fragola|cocoa|cioccolato|candy|caramello|popcorn|donut|ciambella|fruit|frutto|bread|pane|arepa|coffee|cappuccino|cappuccina|spaghetti|pasta|burger|mcdonalds|peppermint|krupuk/.test(combined);

  // Hat / Headgear
  const hasHat = /hat|cap|sombrero|chapeau|beret|crown|corona|helmet|casco|bonnet|headband|calyx/.test(combined);

  // Glasses / Mask
  const hasGlasses = /glasses|lunettes|sunglasses|occhiali|mask|maschera|blindfold|goggles/.test(combined);

  // Weapon / Combat
  const hasWeapon = /sword|spada|gun|pistol|bomb|bomba|assassin|ninja|laser|weapon|knife|coltello|cannon|cannone/.test(combined);

  // Flying / Wings
  const isFlying = /wing|ali|fly|volante|plane|aereo|helicopter|elivolante|bird|dragon|drago|bat|pipistrello/.test(combined);

  // Multiple entities (duo, family, etc.)
  const hasMultiple = /family|famiglia|bros|fratelli|duo|trio|and | e |&|sis|sisters/.test(lowerTitle);

  // Dominant color detection
  let color = 'Multicolore';
  if (/rosso|red|rouge|crimson|strawberry|cherry/.test(combined)) color = 'Rouge';
  else if (/blu|blue|bleu|azzurr|aqua|cyan/.test(combined)) color = 'Bleu';
  else if (/verde|green|vert|emerald|cacto|lime/.test(combined)) color = 'Vert';
  else if (/giallo|yellow|jaune|gold|dorato|cheese|banana/.test(combined)) color = 'Jaune';
  else if (/nero|black|noir|dark|shadow|obsidian/.test(combined)) color = 'Noir';
  else if (/bianco|white|blanc|snow|ice|latte/.test(combined)) color = 'Blanc';
  else if (/rosa|pink|rose/.test(combined)) color = 'Rose';
  else if (/marrone|brown|marron|crostini|chocolate/.test(combined)) color = 'Marron';
  else if (/viola|purple|violet|galaxy/.test(combined)) color = 'Violet';

  // Entity Type
  let type = 'Humanoïde';
  if (isAnimal && isFood) type = 'Hybride Animal-Nourriture';
  else if (isAnimal) type = 'Animal';
  else if (isFood) type = 'Nourriture';
  else if (/robot|cyborg|mech|mecha/.test(combined)) type = 'Robot';
  else if (/car|truck|plane|train|veicolo|vehicle|bike|biciclet/.test(combined)) type = 'Véhicule';
  else if (hasMultiple) type = 'Groupe';

  return {
    isAnimal,
    isFood,
    hasHat,
    hasGlasses,
    hasWeapon,
    isFlying,
    hasMultiple,
    color,
    type
  };
}

async function fetchBrainrotDetails(titles) {
  // Query 20 titles at a time
  const chunks = [];
  for (let i = 0; i < titles.length; i += 20) {
    chunks.push(titles.slice(i, i + 20));
  }

  const results = [];

  for (const chunk of chunks) {
    const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(chunk.join('|'))}&prop=pageimages|revisions&piprop=original|thumbnail&pithumbsize=400&rvprop=content&format=json`;
    try {
      const data = await fetchJson(url);
      const pages = data.query?.pages || {};

      for (const id in pages) {
        const page = pages[id];
        if (page.missing) continue;

        const title = page.title;
        const img = page.thumbnail?.source || page.original?.source;
        if (!img) continue; // Only keep characters with real official image

        const wikitext = page.revisions?.[0]?.['*'] || '';

        // Extract rarity from infobox or category
        const rarityMatch = wikitext.match(/rarity\s*=\s*([^\n|}]+)/i);
        let rarity = rarityMatch ? rarityMatch[1].trim() : 'Common';
        // Clean wikitext brackets
        rarity = rarity.replace(/[{}\[\]]/g, '').trim();

        // Income & Cost
        const incomeMatch = wikitext.match(/income\s*=\s*([^\n|}]+)/i);
        const costMatch = wikitext.match(/cost\s*=\s*([^\n|}]+)/i);
        const income = incomeMatch ? incomeMatch[1].trim() : '?';
        const cost = costMatch ? costMatch[1].trim() : '?';

        // Quote / Sound
        const quoteMatch = wikitext.match(/{{Quote(?:New)?\|([^|}]+)/i);
        const quote = quoteMatch ? quoteMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 160) : null;

        // Caption
        const captionMatch = wikitext.match(/caption-image1\s*=\s*([^\n|}]+)/i);
        const caption = captionMatch ? captionMatch[1].trim() : null;

        const traits = determineTraits(title, wikitext);

        const safeId = title.toLowerCase().replace(/[^a-z0-9]/g, '_');

        results.push({
          id: safeId,
          name: title,
          rarity,
          imageUrl: img,
          localImage: `/images/brainrots/${safeId}.png`,
          income,
          cost,
          quote: quote || caption || `Le légendaire ${title} de Steal a Brainrot !`,
          traits: {
            ...traits,
            rarity
          }
        });
      }
    } catch (err) {
      console.error('Error fetching chunk:', err.message);
    }
    await sleep(200);
  }

  return results;
}

// Download image locally to ensure 100% reliability
async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://stealabr.fandom.com/'
      }
    });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    return false;
  }
}

async function run() {
  console.log('🚀 Démarrage de la récupération des Brainrots depuis Steal a Brainrot Fandom Wiki API...');

  const allTitles = new Set();
  const categoryMap = {};

  for (const cat of CATEGORIES) {
    console.log(`🔍 Exploration de ${cat.name} (${cat.category})...`);
    const members = await getCategoryMembers(cat.category);
    console.log(`   -> ${members.length} personnages trouvés`);
    for (const m of members) {
      allTitles.add(m);
      if (!categoryMap[m]) categoryMap[m] = cat.name;
    }
    await sleep(150);
  }

  const titleList = Array.from(allTitles);
  console.log(`\n📦 Total personnages uniques à inspecter: ${titleList.length}`);

  const brainrots = await fetchBrainrotDetails(titleList);
  console.log(`✨ ${brainrots.length} Brainrots récupérés avec succès avec image et caractéristiques !`);

  // Fix rarities if missing
  for (const b of brainrots) {
    if ((!b.rarity || b.rarity === 'Unknown') && categoryMap[b.name]) {
      b.rarity = categoryMap[b.name];
      b.traits.rarity = b.rarity;
    }
  }

  // Sort by rarity prestige
  const rarityOrder = { 'Common': 1, 'Rare': 2, 'Epic': 3, 'Legendary': 4, 'Mythic': 5, 'Secret': 6, 'Brainrot God': 7, 'OG': 8 };
  brainrots.sort((a, b) => (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0));

  // Download thumbnails locally for offline / high-speed Render hosting
  console.log(`\n📥 Téléchargement local des images dans server/data/images/...`);
  let downloadedCount = 0;
  for (let i = 0; i < brainrots.length; i++) {
    const b = brainrots[i];
    const dest = path.join(IMAGES_DIR, `${b.id}.png`);
    if (!fs.existsSync(dest)) {
      const ok = await downloadImage(b.imageUrl, dest);
      if (ok) downloadedCount++;
      // Sleep a tiny bit to be gentle
      if (i % 10 === 0) {
        process.stdout.write(`\rTéléchargé: ${i + 1}/${brainrots.length}`);
      }
      await sleep(50);
    } else {
      downloadedCount++;
    }
  }
  console.log(`\n✅ ${downloadedCount} images prêtes et sauvegardées localement !`);

  // Write JSON
  const outputPath = path.join(DATA_DIR, 'brainrots.json');
  fs.writeFileSync(outputPath, JSON.stringify(brainrots, null, 2), 'utf-8');
  console.log(`💾 Base de données sauvegardée dans ${outputPath} (${brainrots.length} personnages)`);
}

run().catch(console.error);

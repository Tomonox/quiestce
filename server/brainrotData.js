import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'brainrots.json');

let brainrotsCache = [];

export function loadBrainrots() {
  if (brainrotsCache.length > 0) return brainrotsCache;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      brainrotsCache = JSON.parse(raw);
      console.log(`Loaded ${brainrotsCache.length} brainrots into memory.`);
    } else {
      console.warn('Warning: brainrots.json not found yet.');
    }
  } catch (err) {
    console.error('Error loading brainrots.json:', err);
  }
  return brainrotsCache;
}

export function getAllBrainrots() {
  if (brainrotsCache.length === 0) loadBrainrots();
  return brainrotsCache;
}

export function getBrainrotById(id) {
  const all = getAllBrainrots();
  return all.find(b => b.id === id);
}

// Generate a balanced game board of N characters
export function generateGameBoard(size = 24) {
  const all = getAllBrainrots();
  if (all.length <= size) return [...all];

  // Group by rarity to ensure great diversity on the board
  const groups = {
    Common: [],
    Rare: [],
    Epic: [],
    Legendary: [],
    Mythic: [],
    Secret: [],
    OG: [],
    'Brainrot God': []
  };

  all.forEach(b => {
    if (groups[b.rarity]) groups[b.rarity].push(b);
    else groups.Common.push(b);
  });

  const selected = [];
  const rarities = Object.keys(groups);

  // Take 2-4 from each rarity group
  let index = 0;
  while (selected.length < size) {
    const r = rarities[index % rarities.length];
    const pool = groups[r];
    if (pool && pool.length > 0) {
      const randIdx = Math.floor(Math.random() * pool.length);
      const item = pool.splice(randIdx, 1)[0];
      selected.push(item);
    }
    index++;
    if (index > 500) break; // safety
  }

  // Shuffle board
  return selected.sort(() => Math.random() - 0.5);
}

export function pickSecretBrainrot(board) {
  const randIdx = Math.floor(Math.random() * board.length);
  return board[randIdx];
}

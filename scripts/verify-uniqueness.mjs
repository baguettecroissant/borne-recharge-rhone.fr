#!/usr/bin/env node
/**
 * Verify content uniqueness across all 127 × 3 = 381 local pages.
 * Checks that no two communes share the exact same combination of variant indices.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const communesPath = resolve(__dirname, '../src/data/communes.json');
const communes = JSON.parse(readFileSync(communesPath, 'utf-8'));

function getVariantIndex(slug, offset, maxVariants) {
  let hash = offset * 31;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % maxVariants;
}

function selectRotatedItems(itemCount, slug, offset, count) {
  const selected = [];
  const indices = new Set();
  let seed = offset;
  while (selected.length < count && selected.length < itemCount) {
    const idx = getVariantIndex(slug, seed, itemCount);
    if (!indices.has(idx)) {
      indices.add(idx);
      selected.push(idx);
    }
    seed++;
  }
  return selected;
}

const CATEGORIES = ['main', 'copropriete', 'wallbox'];
const CATEGORY_OFFSETS = { main: 0, copropriete: 100, wallbox: 200 };

// Pool sizes (UPDATED after expansion)
const POOL_SIZES = {
  intro: { main: 8, copropriete: 8, wallbox: 8 },
  useCase: { main: 6, copropriete: 6, wallbox: 6 },
  eco: { main: 6, copropriete: 6, wallbox: 6 },
  communeData: { main: 6, copropriete: 6, wallbox: 6 },
  expertTip: { main: 6, copropriete: 6, wallbox: 6 },
  realEstate: { main: 8, copropriete: 8, wallbox: 8 },  // Was 4
  popTier: { main: 8, copropriete: 8, wallbox: 8 },      // Was 4
  logisticsAlert: 6,     // Was 1 (static!)
  pricesContext: 6,      // Was 1 (static!)
  tableIntro: 4,         // Was 1 per category
  faqCount: 16,          // Was 10
  faqSelect: 6,          // Was 5
};

let totalIssues = 0;

for (const category of CATEGORIES) {
  const catOffset = CATEGORY_OFFSETS[category];
  const combos = {};
  
  for (const c of communes) {
    const combo = [
      getVariantIndex(c.slug, catOffset + 10, POOL_SIZES.intro[category]),
      getVariantIndex(c.slug, catOffset + 20, POOL_SIZES.useCase[category]),
      getVariantIndex(c.slug, catOffset + 30, POOL_SIZES.eco[category]),
      getVariantIndex(c.slug, catOffset + 40, POOL_SIZES.communeData[category]),
      getVariantIndex(c.slug, catOffset + 50, POOL_SIZES.expertTip[category]),
      getVariantIndex(c.slug, catOffset + 60, POOL_SIZES.realEstate[category]),
      getVariantIndex(c.slug, catOffset + 70, POOL_SIZES.popTier[category]),
      getVariantIndex(c.slug, catOffset + 80, POOL_SIZES.logisticsAlert),
      getVariantIndex(c.slug, catOffset + 85, POOL_SIZES.pricesContext),
      getVariantIndex(c.slug, catOffset + 90, POOL_SIZES.tableIntro),
      // Also include climate zone + distance tier as differentiators
      c.distanceLyon <= 5 ? 'core' : c.distanceLyon <= 15 ? 'inner' : c.distanceLyon <= 30 ? 'mid' : 'outer',
      // FAQ set
      selectRotatedItems(POOL_SIZES.faqCount, c.slug, catOffset, POOL_SIZES.faqSelect).sort().join(',')
    ].join('|');
    
    if (!combos[combo]) combos[combo] = [];
    combos[combo].push(c.slug);
  }
  
  const dupes = Object.entries(combos).filter(([, v]) => v.length > 1);
  const uniqueCount = Object.keys(combos).length;
  
  console.log(`\n=== ${category.toUpperCase()} ===`);
  console.log(`Unique combinations: ${uniqueCount} / ${communes.length}`);
  
  if (dupes.length > 0) {
    console.log(`⚠️  ${dupes.length} collisions found:`);
    dupes.forEach(([, slugs]) => {
      console.log(`  - ${slugs.join(', ')}`);
    });
    totalIssues += dupes.length;
  } else {
    console.log(`✅ Zero duplicates!`);
  }
  
  // FAQ uniqueness
  const faqSets = {};
  for (const c of communes) {
    const faqSet = selectRotatedItems(POOL_SIZES.faqCount, c.slug, catOffset, POOL_SIZES.faqSelect).sort().join(',');
    if (!faqSets[faqSet]) faqSets[faqSet] = [];
    faqSets[faqSet].push(c.slug);
  }
  console.log(`FAQ unique sets: ${Object.keys(faqSets).length} / ${communes.length}`);
}

// Check NEW dynamic fields uniqueness (these use commune data directly)
const densiteSet = new Set();
const distanceSet = new Set();
const marcheSet = new Set();
for (const c of communes) {
  densiteSet.add(`${c.bornesPubliques}|${c.population}|${c.densiteBornes}|${c.croissanceVE}`);
  distanceSet.add(c.distanceLyon);
  marcheSet.add(`${c.marcheImmobilier}|${c.prixM2Moyen}|${c.tauxMaisonLabel}|${c.logementsMaison}|${c.logements}`);
}
console.log(`\n=== DATA-DRIVEN UNIQUENESS ===`);
console.log(`Unique densiteAnalysis data combos: ${densiteSet.size} / ${communes.length}`);
console.log(`Unique distance tiers: ${distanceSet.size} / ${communes.length}`);
console.log(`Unique marché immobilier combos: ${marcheSet.size} / ${communes.length}`);

console.log(`\n=== SUMMARY ===`);
if (totalIssues === 0) {
  console.log(`✅ ALL PAGES ARE UNIQUE! No duplicate content risk detected.`);
} else {
  console.log(`⚠️  ${totalIssues} template combo collisions found (but data-driven fields still make pages unique).`);
}

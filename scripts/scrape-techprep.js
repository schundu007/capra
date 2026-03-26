#!/usr/bin/env node
/**
 * Scrape DSA problems from TechPrep.app
 * Extracts: description, examples, test cases, solutions (Python, JS, Java, Go, C++)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'problems-full.json');

const DELAY_MS = 800;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function parseRSC(html) {
  const chunks = [];
  const regex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let m;
  while ((m = regex.exec(html)) !== null) chunks.push(m[1]);
  return chunks.join('');
}

/** Unescape RSC string to get real values */
function unesc(s) {
  return s
    .replace(/\\\\n/g, '\n')
    .replace(/\\\\t/g, '\t')
    .replace(/\\\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\u003e/g, '>')
    .replace(/\\u003c/g, '<');
}

function extractMeta(rsc) {
  // In RSC, quotes are escaped as \"
  const m = rsc.match(/\\\"description\\\",\\\"content\\\":\\\"((?:[^\\]|\\[^"])*?)\\\"/);
  if (m) return unesc(m[1]);

  // Fallback: try with raw escaped
  const m2 = rsc.match(/description","content":"((?:[^"\\]|\\.)*?)"/);
  if (m2) return unesc(m2[1]);

  return null;
}

function extractTestCases(rsc) {
  const m = rsc.match(/test_cases\\?":\[([^\]]+)\]/);
  if (m) {
    try {
      const fixed = unesc(m[1]);
      return JSON.parse('[' + fixed + ']');
    } catch { return []; }
  }
  return [];
}

function extractParamTypes(rsc) {
  const m = rsc.match(/input_param_types\\?":\{([^}]+)\}/);
  if (m) {
    try {
      const fixed = unesc(m[1]);
      return JSON.parse('{' + fixed + '}');
    } catch { return {}; }
  }
  return {};
}

function extractSolutions(rsc) {
  const solutions = {};
  // Match: display_solution_code\":\"<code>\",\"language\":\"<lang>\"
  const regex = /display_solution_code\\":\\"((?:[^\\]|\\[^"])*?)\\"[,}].*?\\"language\\":\\"(\w+)\\"/g;
  let m;
  while ((m = regex.exec(rsc)) !== null) {
    const code = unesc(m[1]);
    solutions[m[2]] = code;
  }
  return solutions;
}

function extractBoilerplate(rsc) {
  const boilerplate = {};
  const regex = /boilerplate_code\\":\\"((?:[^\\]|\\[^"])*?)\\",\\"(?:display|language)/g;
  let m;
  while ((m = regex.exec(rsc)) !== null) {
    const code = unesc(m[1]);
    if (code.includes('def ') && code.includes('self')) boilerplate.python = code;
    else if (code.includes('function') || code.includes('=>')) boilerplate.javascript = code;
    else if (code.includes('public class') || code.includes('public int')) boilerplate.java = code;
    else if (code.includes('func ') && !code.includes('function')) boilerplate.go = code;
    else if (code.includes('vector<') || code.includes('class Solution {')) boilerplate.cpp = code;
  }
  return boilerplate;
}

function extractDescriptionText(rsc) {
  // Get text from Contentful rich text nodes
  const textRegex = /\\"value\\":\\"((?:[^\\]|\\[^"])*?)\\"/g;
  const parts = [];
  let m;
  while ((m = textRegex.exec(rsc)) !== null) {
    const val = unesc(m[1]).trim();
    if (val && val.length > 0) parts.push(val);
  }

  // Build description: find where problem text starts
  let desc = '';
  let started = false;
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!started && (lower.startsWith('given') || lower.startsWith('you are') ||
        lower.startsWith('design') || lower.startsWith('implement') ||
        lower.startsWith('write') || lower.startsWith('find') ||
        lower.startsWith('determine') || lower.startsWith('a ') ||
        lower.startsWith('the '))) {
      started = true;
    }
    if (started) {
      desc += part + ' ';
      // Stop after constraints section
      if (lower.includes('constraints:') || desc.length > 1500) break;
    }
  }
  return desc.trim() || null;
}

async function fetchProblem(slug, topic) {
  const url = `https://www.techprep.app/problems/${slug}/description?topic=${topic}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const html = await res.text();
    const rsc = parseRSC(html);

    const meta = extractMeta(rsc);
    const richDesc = extractDescriptionText(rsc);
    const testCases = extractTestCases(rsc);
    const paramTypes = extractParamTypes(rsc);

    if (!meta && !richDesc) return null;

    // Fetch solutions
    await sleep(DELAY_MS);
    let solutions = {};
    let boilerplate = {};
    try {
      const solRes = await fetch(`https://www.techprep.app/problems/${slug}/solution?topic=${topic}`);
      if (solRes.ok) {
        const solRsc = parseRSC(await solRes.text());
        solutions = extractSolutions(solRsc);
        boilerplate = extractBoilerplate(solRsc);
      }
    } catch {}

    return {
      slug,
      topic,
      description: richDesc || meta || '',
      meta: meta || '',
      testCases,
      paramTypes,
      solutions,
      boilerplate,
    };
  } catch { return null; }
}

function getAllSlugsFromDocs() {
  const docsPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'DocsPage.jsx');
  const content = fs.readFileSync(docsPath, 'utf8');
  const slugSet = new Set();
  const categoryNames = new Set(['Arrays & Strings', 'Two Pointers & Sliding Window', 'Searching & Sorting',
    'Stacks & Queues', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Advanced Patterns']);

  const nameRegex = /name:\s*'([^']+)'/g;
  let m;
  while ((m = nameRegex.exec(content)) !== null) {
    if (categoryNames.has(m[1])) continue;
    const slug = m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    slugSet.add(slug);
  }
  return [...slugSet];
}

function guessTopicForSlug(slug) {
  if (slug.includes('tree') || slug.includes('bst') || slug.includes('inorder') || slug.includes('preorder')) return 'trees';
  if (slug.includes('linked-list') || slug.includes('list-cycle') || slug.includes('lru-cache')) return 'linked-lists';
  if (slug.includes('graph') || slug.includes('island') || slug.includes('course-schedule') || slug.includes('province')) return 'graphs';
  if (slug.includes('stack') || slug.includes('parenthes') || slug.includes('polish')) return 'stacks';
  if (slug.includes('queue') || slug.includes('moving-average')) return 'queues';
  if (slug.includes('window') || slug.includes('substring')) return 'sliding-window';
  if (slug.includes('binary-search') || slug.includes('rotated-sorted') || slug.includes('first-bad')) return 'binary-search';
  if (slug.includes('palindrome') || slug.includes('three-sum') || slug.includes('container-with')) return 'two-pointers';
  if (slug.includes('trie') || slug.includes('prefix-tree')) return 'tries';
  if (slug.includes('heap') || slug.includes('kth-largest') || slug.includes('top-k')) return 'heaps';
  if (slug.includes('interval') || slug.includes('meeting-room')) return 'intervals';
  if (slug.includes('bit') || slug.includes('single-number')) return 'bit-manipulation';
  if (slug.includes('matrix') || slug.includes('spiral') || slug.includes('rotate-image')) return 'matrix';
  if (slug.includes('climbing') || slug.includes('house-robber') || slug.includes('coin-change') || slug.includes('unique-paths')) return 'dynamic-programming';
  if (slug.includes('sort') || slug.includes('merge-sort')) return 'sorting-algorithms';
  if (slug.includes('permutation') || slug.includes('combination') || slug.includes('subset')) return 'recursion';
  return 'arrays';
}

async function main() {
  console.log('Extracting problem slugs...');
  const slugs = getAllSlugsFromDocs();
  console.log(`Found ${slugs.length} problems\n`);

  let results = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try { results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')); } catch {}
    console.log(`Loaded ${Object.keys(results).length} existing\n`);
  }

  let fetched = 0, failed = 0, skipped = 0;

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    if (results[slug]) { skipped++; continue; }

    const topic = guessTopicForSlug(slug);
    process.stdout.write(`[${i+1}/${slugs.length}] ${slug} (${topic})... `);

    const data = await fetchProblem(slug, topic);
    if (data) {
      results[slug] = data;
      fetched++;
      const solCount = Object.keys(data.solutions).length;
      console.log(`OK (${solCount} solutions, ${data.description.length} chars desc)`);
    } else {
      failed++;
      console.log('404');
    }

    await sleep(DELAY_MS);

    if (fetched > 0 && fetched % 20 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
      console.log(`  === Saved ${Object.keys(results).length} problems ===`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n=== Done! ===`);
  console.log(`Fetched: ${fetched}, Failed/404: ${failed}, Skipped: ${skipped}`);
  console.log(`Total: ${Object.keys(results).length} problems`);
}

main().catch(console.error);

#!/usr/bin/env node
/**
 * Scrape missing DSA problems from LeetCode GraphQL API
 * Fills in problems that TechPrep didn't have
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.join(__dirname, '..', 'frontend', 'src', 'data', 'problems-full.json');

const DELAY_MS = 600;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/** Strip HTML tags and convert to plain text */
function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<pre[^>]*>/g, '\n')
    .replace(/<\/pre>/g, '\n')
    .replace(/<strong[^>]*>/g, '**')
    .replace(/<\/strong>/g, '**')
    .replace(/<em>/g, '*')
    .replace(/<\/em>/g, '*')
    .replace(/<code>/g, '`')
    .replace(/<\/code>/g, '`')
    .replace(/<li>/g, '- ')
    .replace(/<\/li>/g, '\n')
    .replace(/<p>/g, '')
    .replace(/<\/p>/g, '\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<sup>/g, '^')
    .replace(/<\/sup>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchFromLeetCode(slug) {
  const query = `query questionContent($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      title
      titleSlug
      difficulty
      content
      exampleTestcaseList
      topicTags { name slug }
      hints
    }
  }`;

  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { titleSlug: slug } }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const q = data?.data?.question;
    if (!q || !q.content) return null;

    return {
      slug: q.titleSlug,
      title: q.title,
      difficulty: q.difficulty,
      description: htmlToText(q.content),
      descriptionHtml: q.content,
      examples: q.exampleTestcaseList || [],
      tags: (q.topicTags || []).map(t => t.name),
      hints: q.hints || [],
      source: 'leetcode',
    };
  } catch (e) {
    return null;
  }
}

function getAllSlugsFromDocs() {
  const docsPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'DocsPage.jsx');
  const content = fs.readFileSync(docsPath, 'utf8');
  const slugMap = new Map(); // slug -> name
  const categoryNames = new Set(['Arrays & Strings', 'Two Pointers & Sliding Window', 'Searching & Sorting',
    'Stacks & Queues', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Advanced Patterns']);

  const nameRegex = /name:\s*'([^']+)'/g;
  let m;
  while ((m = nameRegex.exec(content)) !== null) {
    if (categoryNames.has(m[1])) continue;
    const slug = m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    slugMap.set(slug, m[1]);
  }
  return slugMap;
}

async function main() {
  console.log('Loading existing data...');
  let results = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try { results = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')); } catch {}
  }
  console.log(`Existing: ${Object.keys(results).length} problems (from TechPrep)\n`);

  const slugMap = getAllSlugsFromDocs();
  const allSlugs = [...slugMap.keys()];
  const missing = allSlugs.filter(s => !results[s]);
  console.log(`Total problems: ${allSlugs.length}`);
  console.log(`Missing: ${missing.length} — fetching from LeetCode\n`);

  let fetched = 0, failed = 0;

  for (let i = 0; i < missing.length; i++) {
    const slug = missing[i];
    const name = slugMap.get(slug);
    process.stdout.write(`[${i+1}/${missing.length}] ${slug}... `);

    const data = await fetchFromLeetCode(slug);
    if (data) {
      results[slug] = {
        slug: data.slug,
        topic: data.tags[0] || 'arrays',
        description: data.description,
        meta: data.description.substring(0, 200),
        testCases: data.examples.map((ex, idx) => ({ index: idx, input: ex })),
        paramTypes: {},
        solutions: {},
        boilerplate: {},
        difficulty: data.difficulty,
        tags: data.tags,
        hints: data.hints,
        source: 'leetcode',
      };
      fetched++;
      console.log(`OK (${data.difficulty}, ${data.description.length} chars)`);
    } else {
      // Try alternate slug formats
      const altSlugs = [
        slug,
        slug.replace(/-i$/, ''),
        slug.replace(/-ii$/, '-ii'),
        slug.replace(/^(\d)/, 'n$1'), // 3sum -> n3sum? no
      ];

      let found = false;
      for (const alt of altSlugs.slice(1)) {
        if (alt === slug) continue;
        const altData = await fetchFromLeetCode(alt);
        if (altData) {
          results[slug] = {
            slug: altData.slug,
            topic: altData.tags[0] || 'arrays',
            description: altData.description,
            meta: altData.description.substring(0, 200),
            testCases: altData.examples.map((ex, idx) => ({ index: idx, input: ex })),
            paramTypes: {},
            solutions: {},
            boilerplate: {},
            difficulty: altData.difficulty,
            tags: altData.tags,
            hints: altData.hints,
            source: 'leetcode',
          };
          fetched++;
          found = true;
          console.log(`OK (alt: ${alt}, ${altData.difficulty})`);
          break;
        }
        await sleep(300);
      }

      if (!found) {
        failed++;
        console.log('NOT FOUND');
      }
    }

    await sleep(DELAY_MS);

    if (fetched > 0 && fetched % 30 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
      console.log(`  === Saved ${Object.keys(results).length} total ===`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\n=== Done! ===`);
  console.log(`LeetCode fetched: ${fetched}, Not found: ${failed}`);
  console.log(`Total problems: ${Object.keys(results).length}`);
}

main().catch(console.error);

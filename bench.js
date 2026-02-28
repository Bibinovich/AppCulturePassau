const { performance } = require('perf_hooks');

const profiles = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Profile Name ${i}`,
  description: i % 2 === 0 ? `This is a description for ${i}` : null,
  category: i % 3 === 0 ? `Category ${i}` : null,
  tags: i % 4 === 0 ? [`tag${i}`, `another${i}`] : null,
}));

function getTags(profile) {
  return Array.isArray(profile.tags) ? profile.tags : [];
}

const q = 'description for 500';

function oldSearch() {
  const start = performance.now();
  const results = profiles.filter(p => {
    const tags = getTags(p);
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q) ||
      (p.category ?? '').toLowerCase().includes(q) ||
      tags.some(t => t.toLowerCase().includes(q))
    );
  });
  const end = performance.now();
  return { time: end - start, count: results.length };
}

// Prepare new format
const profilesWithSearchText = profiles.map(p => {
  const tags = getTags(p);
  const searchableText = `${p.name} ${p.description ?? ''} ${p.category ?? ''} ${tags.join(' ')}`.toLowerCase();
  return { ...p, _searchableText: searchableText };
});

function newSearch() {
  const start = performance.now();
  const results = profilesWithSearchText.filter(p => p._searchableText.includes(q));
  const end = performance.now();
  return { time: end - start, count: results.length };
}

let oldTime = 0;
let newTime = 0;
const iterations = 100;

for (let i = 0; i < iterations; i++) {
  oldTime += oldSearch().time;
  newTime += newSearch().time;
}

console.log(`Old search average time: ${oldTime / iterations} ms`);
console.log(`New search average time: ${newTime / iterations} ms`);

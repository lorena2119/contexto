// Detecta lecciones parecidas sin usar IA: compara los textos en el propio navegador.
const STOP = new Set(('el la los las un una unos unas de del al y o u a en con por para que se su sus lo le les '
  + 'es era fue son mi tu me te nos como mas pero si no ya muy este esta ese esa eso hay le dice dijo').split(' '));

export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(text) {
  return new Set(normalize(text).split(' ').filter((w) => w.length > 2 && !STOP.has(w)));
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / (a.size + b.size - shared);
}

// Frases que aparecen entre «comillas angulares» en la historia
function quoted(text) {
  return [...String(text || '').matchAll(/«([^»]+)»/g)].map((m) => normalize(m[1])).filter((p) => p.length >= 8);
}

const textOf = (ex) => `${ex.story || ''} ${ex.question || ''}`;

// ¿Alguna lección existente menciona esta frase? (se usa antes de pedir el borrador)
export function findByPhrase(phrase, exercises) {
  const wanted = normalize(phrase);
  if (wanted.length < 8) return [];
  return exercises.filter((ex) => {
    const haystack = normalize(`${textOf(ex)} ${(ex.options || []).map((o) => o.text).join(' ')}`);
    return haystack.includes(wanted);
  });
}

// Lecciones existentes que se parecen a la nueva: misma frase entre «», o textos muy parecidos
export function findSimilar(candidate, exercises, { threshold = 0.5, limit = 3 } = {}) {
  const mine = tokens(textOf(candidate));
  const myQuotes = quoted(candidate.story);
  return exercises
    .filter((ex) => ex.id !== candidate.id)
    .map((ex) => {
      const score = jaccard(mine, tokens(textOf(ex)));
      const samePhrase = myQuotes.length > 0 && quoted(ex.story).some((q) => myQuotes.includes(q));
      return { exercise: ex, score, samePhrase };
    })
    .filter((m) => m.samePhrase || m.score >= threshold)
    .sort((a, b) => Number(b.samePhrase) - Number(a.samePhrase) || b.score - a.score)
    .slice(0, limit);
}
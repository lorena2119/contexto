const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voices = [];
let announced = false;

export function isSpeechAvailable() {
  return Boolean(synth) && typeof SpeechSynthesisUtterance !== 'undefined';
}

function loadVoices() {
  voices = synth.getVoices();
}

// Chrome carga las voces de forma asíncrona, por eso se escucha el evento
if (isSpeechAvailable()) {
  loadVoices();
  synth.addEventListener('voiceschanged', loadVoices);
}

function scoreVoice(voice) {
  const lang = voice.lang.replace('_', '-');
  if (!lang.toLowerCase().startsWith('es')) return -1;

  let score = 0;
  if (lang === 'es-CO') score += 30;
  else if (['es-419', 'es-MX', 'es-US'].includes(lang)) score += 20;
  else score += 5;

  if (/natural/i.test(voice.name)) score += 100; // voces neuronales de Edge
  else if (/online/i.test(voice.name)) score += 60;
  if (/google/i.test(voice.name)) score += 40;
  return score;
}

function pickBestVoice() {
  const candidates = voices
    .map((voice) => ({ voice, score: scoreVoice(voice) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score);
  return candidates.length ? candidates[0].voice : null;
}

export function speak(text) {
  if (!isSpeechAvailable()) return;
  synth.cancel();

  const voice = pickBestVoice();
  if (import.meta.env.DEV && !announced) {
    console.info('Voz elegida para Escuchar:', voice ? `${voice.name} (${voice.lang})` : 'predeterminada');
    announced = true;
  }

  // Se lee frase por frase para que no se corte y suene más natural
  const sentences = text.match(/[^.!?…]+[.!?…]*/g) || [text];
  for (const sentence of sentences) {
    const part = sentence.trim();
    if (!part) continue;
    const utterance = new SpeechSynthesisUtterance(part);
    utterance.lang = voice ? voice.lang : 'es-CO';
    if (voice) utterance.voice = voice;
    utterance.rate = 0.92;
    utterance.pitch = 1;
    synth.speak(utterance);
  }
}

export function stopSpeech() {
  if (isSpeechAvailable()) synth.cancel();
}
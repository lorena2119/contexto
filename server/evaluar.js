// Evalúa qué tan bien clasifica la IA las frases etiquetadas de evaluacion/frases.json.
// Uso: con el servidor encendido (npm run server) ejecuta: npm run evaluar
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { calcular, CLASES } from '../evaluacion/metricas.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.API_URL || 'http://localhost:3001';
const PAUSA_MS = Number(process.env.PAUSA_MS || 3500); // el servidor permite 20 solicitudes por minuto
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pct = (v) => (v == null ? '—' : `${(v * 100).toFixed(1)} %`);

async function analizar(frase, contexto, intentos = 3) {
  for (let i = 0; i < intentos; i += 1) {
    const res = await fetch(`${BASE}/api/analizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frase, contexto }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;
    if (res.status === 429 || res.status === 502) { await wait(15_000); continue; }
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  throw new Error('Sin respuesta tras varios intentos');
}

function informe(m, meta) {
  const lineas = [];
  lineas.push('# Evaluación de la clasificación de frases', '');
  lineas.push(`- Fecha: ${meta.fecha}`);
  lineas.push(`- Proveedores: ${meta.proveedores.join(' + ') || 'desconocido'}`);
  lineas.push(`- Frases evaluadas: ${m.total} (con respuesta válida: ${m.validas}; sin respuesta: ${m.sinRespuesta})`, '');
  lineas.push(`**Exactitud (4 clases): ${pct(m.exactitud)}** (${m.aciertos} de ${m.validas})`);
  lineas.push(`**Literal vs. no literal: ${pct(m.exactitudLiteralVsNoLiteral)}**`, '');
  lineas.push('## Por clase', '', '| Clase | Frases | Precisión | Exhaustividad | F1 |', '|---|---|---|---|---|');
  for (const c of CLASES) {
    const p = m.porClase[c];
    lineas.push(`| ${c} | ${p.total} | ${pct(p.precision)} | ${pct(p.recall)} | ${pct(p.f1)} |`);
  }
  lineas.push('', '## Matriz de confusión (filas = etiqueta esperada, columnas = respuesta de la IA)', '');
  lineas.push(`| esperado \\ IA | ${CLASES.join(' | ')} |`, `|---|${CLASES.map(() => '---').join('|')}|`);
  for (const e of CLASES) lineas.push(`| **${e}** | ${CLASES.map((o) => m.matriz[e][o]).join(' | ')} |`);
  lineas.push('', '## Exactitud según la confianza que declara la IA', '', '| Confianza | Frases | Exactitud |', '|---|---|---|');
  for (const [k, v] of Object.entries(m.porConfianza)) lineas.push(`| ${k} | ${v.total} | ${pct(v.aciertos / v.total)} |`);
  lineas.push('', '## Errores', '');
  if (!m.errores.length) lineas.push('Ninguno.');
  for (const f of m.errores) {
    lineas.push(`- **${f.id}** «${f.frase}»${f.contexto ? ` (contexto: ${f.contexto})` : ''}: esperado *${f.esperado}*, la IA dijo *${f.obtenido}*`);
  }
  lineas.push('', '> Las etiquetas esperadas las propuso el equipo y deben ser revisadas por una persona con experiencia; en las frases ambiguas hay varias lecturas razonables.');
  return lineas.join('\n');
}

async function main() {
  const estado = await fetch(`${BASE}/api/estado`).then((r) => r.json()).catch(() => null);
  if (!estado) throw new Error('No se pudo conectar con el servidor. Ejecuta "npm run server" en otra terminal.');
  if (estado.modo !== 'ia') throw new Error('El servidor está en modo demostración: la evaluación necesita una clave de IA en .env.');

  const frases = JSON.parse(await readFile(path.join(root, 'evaluacion/frases.json'), 'utf8'));
  const filas = [];
  console.log(`Evaluando ${frases.length} frases (≈ ${Math.ceil((frases.length * PAUSA_MS) / 60000)} min)…`);

  for (const [i, item] of frases.entries()) {
    const fila = { ...item, obtenido: null, confianza: null, significado: '', proveedor: '', error: '' };
    try {
      const data = await analizar(item.frase, item.contexto);
      if (data.modo === 'ia') {
        fila.obtenido = data.resultado.tipo;
        fila.confianza = data.resultado.confianza;
        fila.significado = data.resultado.significado;
        fila.proveedor = data.proveedor;
      } else {
        fila.error = `respuesta de ${data.modo}, no de la IA`; // el respaldo no cuenta
      }
    } catch (error) {
      fila.error = error.message;
    }
    filas.push(fila);
    const marca = fila.obtenido ? (fila.obtenido === fila.esperado ? 'OK ' : 'X  ') : '?  ';
    console.log(`${marca}${String(i + 1).padStart(2)}/${frases.length} ${item.id} esperado=${item.esperado} IA=${fila.obtenido || fila.error}`);
    await wait(PAUSA_MS);
  }

  const metricas = calcular(filas);
  const meta = { fecha: new Date().toLocaleString('es-CO'), proveedores: [...new Set(filas.map((f) => f.proveedor).filter(Boolean))] };

  const cell = (v) => { const t = String(v ?? ''); return /[";\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const cols = ['id', 'frase', 'contexto', 'esperado', 'obtenido', 'confianza', 'proveedor', 'significado', 'error'];
  const csv = '﻿' + [cols, ...filas.map((f) => cols.map((c) => f[c]))].map((r) => r.map(cell).join(';')).join('\r\n');
  await writeFile(path.join(root, 'evaluacion/resultados.csv'), csv);
  await writeFile(path.join(root, 'evaluacion/informe.md'), informe(metricas, meta));

  console.log(`\nExactitud: ${pct(metricas.exactitud)} · Literal vs no literal: ${pct(metricas.exactitudLiteralVsNoLiteral)}`);
  console.log('Archivos: evaluacion/resultados.csv y evaluacion/informe.md');
}

main().catch((error) => { console.error('Error:', error.message); process.exit(1); });
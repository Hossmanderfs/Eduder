// scripts/carga.js — Prueba de carga del RNF-02 / RNF-04 (400 usuarios concurrentes)
// Uso:  npm run carga                  (400 usuarios, 30 s, contra http://localhost:3000)
//       USUARIOS=200 SEGUNDOS=20 BASE=http://localhost:3000 npm run carga
//
// 1) Registra USUARIOS cuentas de prueba (@miremington.edu.co) y guarda su token.
// 2) Cada "usuario" mantiene una conexión y repite el recorrido típico de un estudiante:
//    GET /levels → GET /profile/summary → GET /lessons/:id/content → POST /exercise/answer
// 3) Imprime peticiones por segundo, latencia (promedio, p95, p99, máx.) y errores.
// Criterio de aceptación: p95 ≤ 1000 ms y 0 respuestas 5xx / errores de conexión.
const autocannon = require('autocannon');

const BASE = process.env.BASE || 'http://localhost:3000';
const USUARIOS = parseInt(process.env.USUARIOS || '400', 10);
const SEGUNDOS = parseInt(process.env.SEGUNDOS || '30', 10);
const LOTE = 20; // registros en paralelo (bcrypt es costoso: evita saturar al preparar los datos)

async function http(method, path, body, token) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  let json = null; try { json = JSON.parse(txt); } catch (_) { /* respuesta no JSON */ }
  return { status: res.status, json };
}

async function main() {
  const sufijo = Date.now();
  console.log(`Preparando ${USUARIOS} usuarios de prueba…`);
  const tokens = [];
  for (let i = 0; i < USUARIOS; i += LOTE) {
    const lote = [];
    for (let j = i; j < Math.min(i + LOTE, USUARIOS); j++) {
      lote.push(http('POST', '/auth/register', {
        correo_institucional: `carga.${sufijo}.${j}@miremington.edu.co`,
        nombre: 'Carga', apellido: `U${j}`, contrasena: 'Clave1234',
      }));
    }
    for (const r of await Promise.all(lote)) {
      if (r.status !== 201) throw new Error(`No se pudo registrar un usuario de prueba (${r.status}): ${JSON.stringify(r.json)}`);
      tokens.push(r.json.token);
    }
  }
  // Datos reales para las peticiones (lección y ejercicio del contenido sembrado)
  const niveles = (await http('GET', '/levels', null, tokens[0])).json;
  const leccion = niveles.flatMap((n) => n.lecciones).find((l) => l.tipo !== 'teoria') || niveles[0].lecciones[0];
  const cont = (await http('GET', `/lessons/${leccion.id_leccion}/content`, null, tokens[0])).json;
  const ej = (cont.ejercicios || [])[0];
  if (!ej) throw new Error('El contenido sembrado no tiene ejercicios: ejecute npm run seed');
  console.log(`Lección ${leccion.id_leccion} · ejercicio ${ej.id_ejercicio}\nIniciando carga: ${USUARIOS} conexiones, ${SEGUNDOS} s…`);

  let k = 0;
  const resultado = await autocannon({
    url: BASE,
    connections: USUARIOS,
    duration: SEGUNDOS,
    requests: [
      { method: 'GET', path: '/levels', setupRequest: (req, ctx) => conToken(req, ctx) },
      { method: 'GET', path: '/profile/summary', setupRequest: (req, ctx) => conToken(req, ctx) },
      { method: 'GET', path: `/lessons/${leccion.id_leccion}/content`, setupRequest: (req, ctx) => conToken(req, ctx) },
      { method: 'POST', path: '/exercise/answer', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id_ejercicio: ej.id_ejercicio, respuesta: 'x' }), setupRequest: (req, ctx) => conToken(req, ctx) },
    ],
  });
  function conToken(req, ctx) {
    if (!ctx.token) ctx.token = tokens[k++ % tokens.length];
    req.headers = { ...(req.headers || {}), authorization: `Bearer ${ctx.token}` };
    return req;
  }

  const l = resultado.latency;
  const r = resultado;
  console.log('\n===== RESULTADO =====');
  console.log(`Usuarios concurrentes: ${USUARIOS} · duración: ${SEGUNDOS} s`);
  console.log(`Peticiones totales: ${r.requests.total} · promedio ${r.requests.average} req/s`);
  console.log(`Latencia (ms): promedio ${l.average} · p50 ${l.p50} · p97.5 ${l.p97_5} · p99 ${l.p99} · máx. ${l.max}`);
  console.log(`2xx: ${r['2xx']} · 4xx: ${r['4xx']} · 5xx: ${r['5xx']} · errores de conexión: ${r.errors} · timeouts: ${r.timeouts}`);
  const ok = l.p97_5 <= 1000 && r['5xx'] === 0 && r.errors === 0 && r.timeouts === 0;
  console.log(ok ? 'CUMPLE el criterio (p95 ≤ 1000 ms, sin errores 5xx ni de conexión).' : 'NO CUMPLE el criterio.');
  process.exit(ok ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(2); });

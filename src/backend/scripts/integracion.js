// scripts/integracion.js — ejecuta la suite completa incluyendo la prueba de integración (multiplataforma).
// Uso: npm run test:integracion   |   npm run cobertura   (requiere BD con DDL v1.2 y `npm run seed`)
const { spawnSync } = require('child_process');
const extra = process.argv.slice(2);
const args = ['jest', ...extra];
if (extra.includes('--coverage')) args.push("--collectCoverageFrom=src/services/*.js", "--collectCoverageFrom=src/controllers/*.js", "--collectCoverageFrom=src/middleware/*.js");
const r = spawnSync('npx', args, { stdio: 'inherit', shell: true, env: { ...process.env, INTEGRACION: '1' } });
process.exit(r.status ?? 1);

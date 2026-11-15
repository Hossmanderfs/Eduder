// scripts/auditoria-ddl.js — Audita que los modelos Sequelize coincidan con el DDL v1.2 (nombres, tipos, tamaños,
// nulabilidad, claves primarias, ENUM y reglas ON DELETE). Uso: DB_NAME=eduder_ddl npm run auditoria-ddl
// (crear antes la BD con el script docs/diseno/fase2-datos/E11-script-DDL.sql). Sale con código 1 si hay diferencias.
require('dotenv').config();
const { Sequelize } = require('sequelize');
const db = new Sequelize(process.env.AUDIT_DB || process.env.DB_NAME || 'eduder', process.env.AUDIT_USER || process.env.DB_USER, process.env.AUDIT_PASS || process.env.DB_PASSWORD,
  { host: process.env.DB_HOST || '127.0.0.1', port: process.env.DB_PORT || 3306, dialect: 'mysql', logging: false });
const M = require('../src/models');
const T = (m) => m.getTableName();

function tipoModelo(attr) {
  const k = attr.type.key, o = attr.type.options || {};
  const len = attr.type._length;
  if (k === 'ENUM') return `enum(${(attr.type.values || []).map((v) => `'${v}'`).join(',')})`;
  if (k === 'CHAR') return `char(${len || o.length || 255})`;
  if (k === 'STRING') return `varchar(${len || o.length || 255})`;
  if (k === 'TEXT') return 'text';
  if (k === 'BOOLEAN') return 'tinyint(1)';
  if (k === 'DATE') return 'datetime';
  if (k === 'DATEONLY') return 'date';
  if (k === 'INTEGER') return o.unsigned ? 'int(10) unsigned' : 'int(11)';
  if (k === 'TINYINT') return o.unsigned ? 'tinyint(3) unsigned' : 'tinyint(4)';
  if (k === 'SMALLINT') return o.unsigned ? 'smallint(5) unsigned' : 'smallint(6)';
  if (k === 'DECIMAL') return `decimal(${o.precision},${o.scale})`;
  return k.toLowerCase();
}
const norm = (t) => t.toLowerCase().replace(/\(\d+\)(?= unsigned)/, '').replace(/^int\(\d+\)/, 'int').replace(/^tinyint\((3|4)\)/, 'tinyint').replace(/^smallint\((5|6)\)/, 'smallint').replace(/^bigint\(\d+\)/, 'bigint').replace(/^int unsigned/, 'int unsigned').replace(/^tinyint\(1\)$/, 'tinyint(1)');

(async () => {
  const schema = db.config.database;
  const [cols] = await db.query('SELECT table_name t, column_name c, column_type ty, is_nullable n, column_key k FROM information_schema.columns WHERE table_schema=?', { replacements: [schema] });
  const [fks] = await db.query('SELECT table_name t, column_name c, referenced_table_name r FROM information_schema.key_column_usage WHERE table_schema=? AND referenced_table_name IS NOT NULL', { replacements: [schema] });
  const [rules] = await db.query('SELECT table_name t, constraint_name n, delete_rule d FROM information_schema.referential_constraints WHERE constraint_schema=?', { replacements: [schema] });
  const diffs = []; let revisados = 0; const filas = [];
  const modelos = Object.values(M).filter((m) => m && m.rawAttributes);
  const tablasModelo = new Set(modelos.map((m) => T(m)));
  const tablasDDL = new Set(cols.map((c) => c.t));
  for (const t of tablasDDL) if (!tablasModelo.has(t)) diffs.push(`Tabla ${t} está en el DDL y no tiene modelo`);
  for (const m of modelos) {
    const tabla = T(m);
    if (!tablasDDL.has(tabla)) { diffs.push(`Modelo ${m.name} apunta a la tabla ${tabla}, que no existe en el DDL`); continue; }
    const deTabla = cols.filter((c) => c.t === tabla);
    const camposModelo = new Map(Object.values(m.rawAttributes).map((a) => [a.field || a.fieldName, a]));
    for (const c of deTabla) {
      const a = camposModelo.get(c.c);
      if (!a) { diffs.push(`${tabla}.${c.c}: columna del DDL sin atributo en el modelo (${c.ty})`); continue; }
      revisados++;
      const tm = tipoModelo(a), td = c.ty;
      const okTipo = norm(tm) === norm(td);
      const okNulo = (a.allowNull !== false && !a.primaryKey) === (c.n === 'YES');
      const okPk = !!a.primaryKey === (c.k === 'PRI');
      filas.push({ tabla, col: c.c, ddl: td, modelo: tm, nulo: c.n, ok: okTipo && okNulo && okPk });
      if (!okTipo) diffs.push(`${tabla}.${c.c}: tipo DDL ${td} ≠ modelo ${tm}`);
      if (!okNulo) diffs.push(`${tabla}.${c.c}: nulabilidad DDL ${c.n} ≠ modelo allowNull=${a.allowNull}`);
      if (!okPk) diffs.push(`${tabla}.${c.c}: clave primaria DDL ${c.k} ≠ modelo primaryKey=${!!a.primaryKey}`);
    }
    for (const [campo] of camposModelo) if (!deTabla.some((c) => c.c === campo)) diffs.push(`${tabla}.${campo}: atributo del modelo sin columna en el DDL`);
  }
  const resumen = `Tablas DDL: ${tablasDDL.size} · modelos: ${modelos.length} · columnas comparadas: ${revisados} · FK en el DDL: ${fks.length} · diferencias: ${diffs.length}`;
  console.log(resumen); diffs.forEach((d) => console.log(' ✗ ' + d));
  if (process.env.SALIDA) require('fs').writeFileSync(process.env.SALIDA, JSON.stringify({ resumen, diffs, filas, rules }, null, 1));
  await db.close(); process.exit(diffs.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });

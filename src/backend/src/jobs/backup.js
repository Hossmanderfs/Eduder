// src/jobs/backup.js — RF-23: backup diario con mysqldump + log de éxito/fallo.
// Guarda el snapshot en BACKUP_DIR (por defecto ./backups) y conserva los últimos
// BACKUP_RETENTION archivos. Si se define BACKUP_UPLOAD_CMD (p. ej. `aws s3 cp {file} s3://bucket/`)
// se ejecuta tras generar el snapshot para subirlo a S3/Firebase Storage.
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIR = () => path.resolve(process.env.BACKUP_DIR || path.join(process.cwd(), 'backups'));
const LOG = () => path.join(DIR(), 'backup.log');

function log(linea) {
  fs.mkdirSync(DIR(), { recursive: true });
  fs.appendFileSync(LOG(), `${new Date().toISOString()} ${linea}\n`);
}

function dump(file) {
  return new Promise((resolve, reject) => {
    const args = [
      `-h${process.env.DB_HOST || 'localhost'}`, `-P${process.env.DB_PORT || 3306}`,
      `-u${process.env.DB_USER}`, '--single-transaction', '--routines', process.env.DB_NAME,
    ];
    const out = fs.createWriteStream(file);
    const p = spawn('mysqldump', args, { env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD || '' } });
    let stderr = '';
    p.stderr.on('data', d => { stderr += d; });
    p.stdout.pipe(out);
    p.on('error', reject);
    p.on('close', code => (code === 0 ? resolve() : reject(new Error(stderr.trim() || `mysqldump salió con código ${code}`))));
  });
}

function limpiar() {
  const keep = parseInt(process.env.BACKUP_RETENTION, 10) || 14;
  const files = fs.readdirSync(DIR()).filter(f => /^eduder_.*\.sql$/.test(f)).sort();
  files.slice(0, Math.max(files.length - keep, 0)).forEach(f => fs.unlinkSync(path.join(DIR(), f)));
}

async function runBackup() {
  fs.mkdirSync(DIR(), { recursive: true });
  const file = path.join(DIR(), `eduder_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`);
  try {
    await dump(file);
    if (process.env.BACKUP_UPLOAD_CMD) {
      await new Promise((res, rej) => exec(process.env.BACKUP_UPLOAD_CMD.replace('{file}', `"${file}"`), e => (e ? rej(e) : res())));
    }
    limpiar();
    log(`OK ${path.basename(file)}`);
    return { ok: true, file: path.basename(file) };
  } catch (err) {
    try { fs.unlinkSync(file); } catch (_) { /* nada */ }
    log(`FALLO ${err.message}`);
    throw err;
  }
}

module.exports = { runBackup };

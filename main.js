import * as baileys from "@whiskeysockets/baileys";
import fs from "fs";
import os from "os"; 
import path from "path";
import chalk from "chalk";
import readlineSync from "readline-sync";
import pino from "pino";
import NodeCache from 'node-cache';
import "./config.js";
import { loadPlugins } from './lib/plugins.js';

await loadPlugins();
const BOT_SESSION_FOLDER = "./Session";
const BOT_CREDS_PATH = path.join(BOT_SESSION_FOLDER, "creds.json");
if (!fs.existsSync(BOT_SESSION_FOLDER)) fs.mkdirSync(BOT_SESSION_FOLDER);
let usarCodigo = false;
let numero = "";

main();

async function main() {
//console.clear();
console.log(chalk.cyanBright.bold("══════════════════════════════"));
console.log(chalk.magentaBright.bold("║ ❧ BASE BOT MULTISOCKET - BAILEYS "));
console.log(chalk.magentaBright.bold("           CEGADO-BOT"));
console.log(chalk.cyanBright.bold("══════════════════════════════"));

const hayCredencialesPrincipal = fs.existsSync(BOT_CREDS_PATH);
const subbotsFolder = "./jadibot";
const haySubbotsActivos = fs.existsSync(subbotsFolder) && fs.readdirSync(subbotsFolder).some(folder =>
fs.existsSync(path.join(subbotsFolder, folder, "creds.json"))
);

if (!hayCredencialesPrincipal && !haySubbotsActivos) {
console.log(chalk.green("1.") + " Conectar con código QR");
console.log(chalk.green("2.") + " Conectar con código de 8 dígitos");
const opcion = readlineSync.question(chalk.yellow("Elige una opción (1 o 2): "));
usarCodigo = opcion === "2";
if (usarCodigo) {
numero = readlineSync.question(chalk.yellow("Ingresa tu número (ej: +521234567890): ")).replace(/[^0-9]/g, '');
if (numero.startsWith('52') && !numero.startsWith('521')) {
numero = '521' + numero.slice(2);
}}
}

if (hayCredencialesPrincipal || !haySubbotsActivos) {
try {
await startBot();
} catch (err) {
console.error(chalk.red("❌ Error al iniciar bot principal:"), err);
}} else {
console.log(chalk.yellow("⚠️ Subbots activos detectados. Bot principal desactivado automáticamente."));
}}

async function startBot() {
const { state, saveCreds } = await baileys.useMultiFileAuthState(BOT_SESSION_FOLDER);
const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const groupCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const { version } = await baileys.fetchLatestBaileysVersion();

const sock = baileys.makeWASocket({
printQRInTerminal: !usarCodigo && !fs.existsSync(BOT_CREDS_PATH),
logger: pino({ level: 'silent' }),   
browser: ['Windows', 'Chrome'],
auth: { creds: state.creds,
keys: baileys.makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
},
markOnlineOnConnect: false, 
generateHighQualityLinkPreview: true, 
syncFullHistory: false,
getMessage: async (key) => {
try {
let jid = jidNormalizedUser(key.remoteJid);
let msg = await store.loadMessage(jid, key.id);
return msg?.message || "";
} catch (error) {
return "";
}},
msgRetryCounterCache: msgRetryCounterCache || new Map(),
userDevicesCache: userDevicesCache || new Map(),
//msgRetryCounterMap,
defaultQueryTimeoutMs: undefined,
cachedGroupMetadata: async (jid) => groupCache.get(jid),
version: version, 
defaultQueryTimeoutMs: 30_000,
keepAliveIntervalMs: 55000, 
maxIdleTimeMs: 60000, 
});

globalThis.conn = sock;
setupGroupEvents(sock);
sock.ev.on("creds.update", saveCreds);

sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
const code = lastDisconnect?.error?.output?.statusCode || 0;

if (connection === "open") {
  const RED = chalk.redBright.bold;
  const CYAN = chalk.cyanBright;
  const RESET = chalk.whiteBright;
  const hora = new Date().toLocaleString("es-US", { timeZone: "America/New_York" });
console.log(chalk.greenBright.bold(`
┏┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•
┋ ❧ ${RED('𝙲𝙾𝙽𝙴𝙲𝚃𝙰𝙳𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙰𝙼𝙴𝙽𝚃𝙴 𝙰𝙻 𝚆𝙷𝙰𝚃𝚂𝙰𝙿𝙿')} ✔️
┋┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•
┋ ${RED('Hora')}${RESET(':')} ${hora}
┋ ${RED('HostName')}${RESET(':')} ${os.hostname()}
┋ ${RED('Plataforma')}${RESET(':')} ${os.platform()}
┋ ${RED('By')}${RESET(':')} CGD៝PRV₃₋₄
┗┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅•`));
}

if (connection === "close") {
if ([401, 440, 428, 405].includes(code)) {      
console.log(chalk.red(`❌ Error de sesión (${code}) inválida. Borra la carpeta "Session" y vuelve a conectar.`));
}
console.log(chalk.yellow("♻️ Conexión cerrada. Reintentando en 3s..."));
setTimeout(() => startBot(), 3000);
}});

process.on('uncaughtException', console.error);
  
if (usarCodigo && !state.creds.registered) {
setTimeout(async () => {
try {
const code = await sock.requestPairingCode(numero);
console.log(chalk.yellow('Código de emparejamiento:'), chalk.greenBright(code));
} catch {}
}, 2000);
}

sock.ev.on("messages.upsert", async ({ messages, type }) => {
if (type !== "notify") return;
for (const msg of messages) {
if (!msg.message) continue;
if (msg.messageTimestamp && (Date.now() / 1000 - msg.messageTimestamp) > 30) continue;
try {
const { handler } = await import("./handler.js");
await handler(sock, msg);
} catch (err) {
console.error(err);
}}
});
  
sock.ev.on("call", async (calls) => {
try {
const { callUpdate } = await import("./handler.js");
for (const call of calls) {
await callUpdate(sock, call);
}} catch (err) {
console.error(chalk.red("❌ Error procesando call.update:"), err);
}
});
    
//tmp    
setInterval(() => {
const tmp = './tmp';
try {
const files = fs.readdirSync(tmp);
files.forEach(file => {
if (file.endsWith('.file')) return;
const filePath = path.join(tmp, file);
const stats = fs.statSync(filePath);
const now = Date.now();
const modifiedTime = new Date(stats.mtime).getTime();
const age = now - modifiedTime;
if (age > 3 * 60 * 1000) {
fs.unlinkSync(filePath);
}});
} catch (err) {
console.error('Error cleaning temporary files:', err);
}}, 30 * 1000);
        
setInterval(() => {
console.log('♻️ Reiniciando bot automáticamente...');
process.exit(0); 
}, 10800000) //3hs
//3600000
    
function setupGroupEvents(sock) {
sock.ev.on("group-participants.update", async (update) => {
try {
const { participantsUpdate } = await import("./handler.js");
await participantsUpdate(sock, update);
} catch (err) {
console.error(chalk.red("❌ Error procesando group-participants.update:"), err);
}});

sock.ev.on("groups.update", async (updates) => {
try {
const { groupsUpdate } = await import("./handler.js");
for (const update of updates) {
await groupsUpdate(sock, update);
}} catch (err) {
console.error(chalk.red("❌ Error procesando groups.update:"), err);
}});
}
}


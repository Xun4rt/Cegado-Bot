// lib/simple.js (CORREGIDO)
// Dependencias: node-fetch, file-type, @whiskeysockets/baileys
import fs from 'fs'
import { fileTypeFromBuffer } from 'file-type'
import path from 'path'
import fetch from 'node-fetch'
import { db } from './postgres.js'
import baileysPkg from '@whiskeysockets/baileys'

const {
  default: _makeWaSocket,
  makeWALegacySocket,
  proto,
  downloadMediaMessage,
  downloadContentFromMessage,
  jidDecode,
  areJidsSameUser,
  generateWAMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  WAMessageStubType,
  extractMessageContent,
  WA_DEFAULT_EPHEMERAL,
  prepareWAMessageMedia,
} = baileysPkg.default || baileysPkg // compatibilidad

/**
 * smsg: normaliza el mensaje recibido y agrega helpers
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 * @param {object} m - mensaje crudo
 */
export async function smsg(conn, m) {
  try {
    if (!m) return m

    // seguridad: proto puede no estar definido por fallback de import
    const Mproto = proto && proto.WebMessageInfo ? proto.WebMessageInfo : null

    // m.db helper
    m.db = { query: (...args) => db.query(...args) }

    // mencionado y quoted
    try {
      if (!m.mentionedJid) m.mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    } catch (e) {
      m.mentionedJid = []
    }

    if (!m.quoted && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const ctx = m.message.extendedTextMessage.contextInfo
      const quotedMessage = {
        key: {
          id: ctx.stanzaId,
          fromMe: ctx.participant === conn.user?.jid,
          remoteJid: m.chat,
          participant: ctx.participant,
        },
        message: ctx.quotedMessage,
        messageTimestamp: m.messageTimestamp,
        participant: ctx.participant,
        sender: ctx.participant,
        chat: m.chat,
      }
      m.quoted = {
        ...quotedMessage,
        download: () => downloadMediaMessage(quotedMessage, 'buffer', {}),
      }
    }

    // usuario desde DB
    try {
      const resUser = await db.query('SELECT * FROM usuarios WHERE id = $1', [m.sender])
      m.user = resUser.rows[0] || {}
    } catch (e) {
      console.error('❌ Error al obtener datos del usuario:', e)
      m.user = {}
    }

    // datos de grupo desde DB
    if (m.isGroup) {
      try {
        const resChat = await db.query('SELECT * FROM group_settings WHERE group_id = $1', [m.chat])
        m.chatDB = resChat.rows[0] || {}
      } catch (e) {
        console.error('❌ Error al obtener datos del grupo:', e)
        m.chatDB = {}
      }
    }

    // inferred quoted mimetype
    if (m.quoted && m.quoted.message && typeof m.quoted.message === 'object') {
      const keys = Object.keys(m.quoted.message)
      if (keys.length > 0) {
        const type = keys[0]
        const media = m?.quoted.message[type]
        if (type?.includes('image')) m.quoted.mimetype = 'image'
        else if (type?.includes('video')) m.quoted.mimetype = 'video'
        else if (type?.includes('sticker')) m.quoted.mimetype = 'image/webp'
        else if (type?.includes('audio')) m.quoted.mimetype = 'audio'
        else if (type?.includes('document')) m.quoted.mimetype = media?.mimetype || 'application/octet-stream'
      }
    }

    // determinar mimetype principal
    if (!m.mimetype) {
      const messageContent = m.message
      if (messageContent) {
        const type = Object.keys(messageContent)[0]
        if (type && type.includes('image')) m.mimetype = 'image'
        else if (type && type.includes('video')) m.mimetype = 'video'
        else if (type && type.includes('sticker')) m.mimetype = 'image/webp'
        else if (type && type.includes('audio')) m.mimetype = 'audio'
        else if (type && type.includes('document')) {
          const msgMedia = messageContent[type]
          m.mimetype = msgMedia?.mimetype || 'application/octet-stream'
        }
      }
    }

    // key/meta
    if (m.key) {
      m.id = m.key.id
      m.chat = m.key.remoteJid
      m.fromMe = m.key.fromMe
      m.isGroup = !!(m.chat && m.chat.endsWith && m.chat.endsWith('@g.us'))
      let senderJid = m.fromMe ? conn.user?.id : m.key.participant || m.key.remoteJid
      if (!senderJid) senderJid = m.key?.remoteJid || ''
      if (String(senderJid).endsWith('@lid')) {
        m.sender = senderJid
      } else {
        m.sender = cleanJid(senderJid)
      }
      m.who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.fromMe ? conn.user?.id : m.sender)
      try {
        m.pp = await conn.profilePictureUrl(m.who, 'image').catch(_ => 'https://telegra.ph/file/33bed21a0eaa789852c30.jpg')
      } catch {
        m.pp = 'https://telegra.ph/file/33bed21a0eaa789852c30.jpg'
      }

      // group metadata helpers
      if (m.isGroup) {
        try {
          const metadata = await conn.groupMetadata(m.chat)
          const participants = metadata.participants || []
          m.isAdmin = participants.some(p => p.id === m.sender && (p.admin === 'admin' || p.admin === 'superadmin'))
          m.isBotAdmin = participants.some(p => p.id === conn.user?.id?.replace?.(/:\d+@/, '@') && (p.admin === 'admin' || p.admin === 'superadmin'))
        } catch (e) {
          m.isAdmin = false
          m.isBotAdmin = false
        }
      }
    }

    // download helper
    m.download = async () => {
      const messageContent = m.message || (m.quoted && m.quoted.message)
      if (!messageContent) throw new Error('No se encontró contenido para descargar')
      const type = Object.keys(messageContent)[0]
      const stream = await downloadContentFromMessage(messageContent[type], type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'document')
      return await streamToBuffer(stream)
    }

    // conn helpers
    conn.decodeJid = (jid) => {
      if (!jid) return jid
      if (String(jid).endsWith('@lid')) return jid
      if (/:\d+@/i.test(jid)) return jid.split(':')[0] + '@s.whatsapp.net'
      return jid
    }

    conn.getName = async (jid, withoutContact = false, mContext = null) => {
      if (!jid) return null
      jid = conn.decodeJid ? conn.decodeJid(jid) : jid
      try {
        if (jid.endsWith('@g.us')) {
          const metadata = await conn.groupMetadata(jid)
          return metadata.subject || (withoutContact ? null : jid.split('@')[0])
        } else {
          if (jid === '0@s.whatsapp.net') return 'WhatsApp'
          if (conn.user?.jid && jid === conn.user.jid) return conn.user.name || jid.split('@')[0]
          if (mContext?.pushName && mContext?.sender === jid) return mContext.pushName

          const res = await db.query('SELECT nombre FROM usuarios WHERE id = $1', [jid])
          if (res.rows.length && res.rows[0].nombre) return res.rows[0].nombre
          return jid.split('@')[0]
        }
      } catch (err) {
        console.error(err)
        return jid.split('@')[0]
      }
    }

    Array.prototype.getRandom = function () {
      return this[Math.floor(Math.random() * this.length)]
    }

    conn.parseMention = async (text = '') => {
      try {
        if (typeof text !== 'string') return []
        const matches = [...text.matchAll(/@([0-9]{5,15})/g)]
        return matches.map(match => `${match[1]}@s.whatsapp.net`).filter(jid => jid.includes('@s.whatsapp.net'))
      } catch (e) {
        console.error(e)
        return []
      }
    }

    conn.reply = async (chatId, text, quoted = null, options = {}) => {
      const contextInfo = {
        mentionedJid: await conn.parseMention(text),
        isForwarded: true,
        forwardingScore: 1
      }
      return await conn.sendMessage(chatId, { text, contextInfo }, { quoted, ...options })
    }

    // reaction
    m.react = async (emoji) => {
      if (!emoji) return
      await conn.sendMessage(m.chat || m.key.remoteJid, {
        react: { text: emoji, key: m.key }
      })
    }

    function formatExternalAdReply(obj = {}) {
      if (!obj.thumbnailUrl && obj.thumbnail) {
        obj.thumbnailUrl = obj.thumbnail
        delete obj.thumbnail
      }
      return {
        ...obj,
        thumbnail: typeof obj.thumbnailUrl === 'string' ? { url: obj.thumbnailUrl } : obj.thumbnailUrl
      }
    }

    conn.sendFile = async function (jid, filePathOrBuffer, filename = '', caption = '', quoted = null, ptt = false, options = {}) {
      const getCleanExt = (url) => {
        const match = String(url).match(/\.([a-zA-Z0-9]+)(\?|$)/)
        return match ? match[1].toLowerCase() : 'bin'
      }

      // Buffer
      if (Buffer.isBuffer(filePathOrBuffer)) {
        const fileInfo = (await fileTypeFromBuffer(filePathOrBuffer)) || {}
        const ext = (filename.includes('.') ? filename.split('.').pop() : getCleanExt('file.' + (fileInfo.ext || 'bin'))).toLowerCase()
        const mime = fileInfo.mime || 'application/octet-stream'
        const fileName = filename || `file.${ext}`

        const messageType = (() => {
          if (ext === 'webp') return 'sticker'
          if (['mp4', 'mov', 'mkv'].includes(ext)) return 'video'
          if (['mp3', 'm4a', 'ogg', 'wav'].includes(ext)) return 'audio'
          if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image'
          if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'document'
          if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'json', 'apk'].includes(ext)) return 'document'
          return 'document'
        })()

        return await this.sendMessage(jid, {
          ...(messageType === 'sticker' ? { sticker: filePathOrBuffer } : { [messageType]: filePathOrBuffer }),
          mimetype: mime,
          fileName,
          caption,
          ...options
        }, { quoted })
      }

      // URL
      if (typeof filePathOrBuffer === 'string' && /https?:\/\//.test(filePathOrBuffer)) {
        try {
          const res = await fetch(filePathOrBuffer)
          const buffer = await res.buffer()
          const fileInfo = (await fileTypeFromBuffer(buffer)) || {}
          const mime = fileInfo.mime || 'application/octet-stream'
          const ext = (filename.includes('.') ? filename.split('.').pop() : getCleanExt(filePathOrBuffer)).toLowerCase()
          const fileName = filename || `file.${ext}`
          const messageType = (() => {
            if (ext === 'webp') return 'sticker'
            if (['mp4', 'mov', 'mkv'].includes(ext)) return 'video'
            if (['mp3', 'm4a', 'ogg', 'wav'].includes(ext)) return 'audio'
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'image'
            if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'document'
            if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'json', 'apk'].includes(ext)) return 'document'
            return 'document'
          })()

          return await this.sendMessage(jid, {
            ...(messageType === 'sticker' ? { sticker: buffer } : { [messageType]: buffer }),
            mimetype: mime,
            fileName,
            caption,
            ...options
          }, { quoted })
        } catch (e) {
          throw new Error(e.message)
        }
      }

      // local path
      if (typeof filePathOrBuffer === 'string') {
        // try read file from disk
        const abs = path.isAbsolute(filePathOrBuffer) ? filePathOrBuffer : path.join(process.cwd(), filePathOrBuffer)
        if (!fs.existsSync(abs)) throw new Error('File not found: ' + abs)
        const buffer = fs.readFileSync(abs)
        return await this.sendFile(jid, buffer, filename || path.basename(abs), caption, quoted, ptt, options)
      }

      throw new Error('Invalid file input')
    }

    conn.sendImage = async function (jid, path, caption = '', quoted = null, options = {}) {
      return this.sendMessage(jid, { image: { url: path }, caption, ...options }, { quoted })
    }

    conn.sendVideo = async function (jid, path, caption = '', quoted = null, options = {}) {
      return this.sendMessage(jid, { video: { url: path }, caption, ...options }, { quoted })
    }

    conn.fakeReply = async function (jid, caption = '', fakeNumber = '0@s.whatsapp.net', fakeCaption = '', quoted = null, options = {}) {
      return this.sendMessage(jid, {
        text: caption,
        ...options
      }, {
        quoted: {
          key: {
            fromMe: false,
            participant: fakeNumber,
            ...(jid.endsWith('@g.us') ? { remoteJid: jid } : { remoteJid: null })
          },
          message: {
            conversation: fakeCaption
          },
          messageTimestamp: parseInt(Date.now() / 1000)
        }
      })
    }

    conn.sendAudio = async function (jid, path, quoted = null, options = {}) {
      return this.sendMessage(jid, { audio: { url: path }, mimetype: 'audio/mpeg', ...options }, { quoted })
    }

    conn.sendDocument = async function (jid, path, filename = 'file', quoted = null, options = {}) {
      return this.sendMessage(jid, { document: { url: path }, fileName: filename, mimetype: 'application/octet-stream', ...options }, { quoted })
    }

    conn.sendSticker = async (jid, path, quoted = null, options = {}) => {
      return conn.sendMessage(jid, { sticker: typeof path === 'string' ? { url: path } : path, ...options }, { quoted })
    }

    conn.sendPtt = async (jid, path, quoted = null, options = {}) => {
      return conn.sendMessage(jid, { audio: { url: path }, mimetype: 'audio/ogg; codecs=opus', ptt: true, ...options }, { quoted })
    }

    return m
  } catch (err) {
    console.error('smsg error:', err)
    return m
  }
}

/** Helpers fuera de smsg **/

function cleanJid(jid) {
  if (!jid) return jid
  if (String(jid).includes('@lid')) return jid // preserve lid
  return String(jid).replace(/:\d+/, '').replace('@s.whatsapp.net', '') + '@s.whatsapp.net'
}

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

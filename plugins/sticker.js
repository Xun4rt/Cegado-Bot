import { writeExif } from "../lib/sticker.js"

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""

  if (!/image|video/.test(mime)) {
    return m.reply(`📸 Responde a una imagen o video con *${usedPrefix + command}*`)
  }

  let media = await q.download()
  if (!media) return m.reply("❌ No pude descargar el archivo")

  let sticker = await writeExif(media, {
    packname: "Cegado-Bot",
    author: "by Tú"
  })

  await conn.sendMessage(m.chat, { sticker }, { quoted: m })
}

handler.command = ["s", "sticker", "stiker"]
export default handler

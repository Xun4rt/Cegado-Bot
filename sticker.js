import fs from "fs"

import path from "path"

import { Sticker, StickerTypes } from "wa-sticker-formatter"

let handler = async (m, { conn }) => {

  // detectar si es mensaje con imagen/video directo o si es respuesta

  let q = m.quoted ? m.quoted : m

  let mime = (q.msg || q).mimetype || ""

  if (!mime) return m.reply("⚠️ Manda o responde a una imagen, video o gif para hacer sticker")

  // descargar media

  let media = await q.download()

  // ruta temporal

  let inputPath = path.join(process.cwd(), "temp_input")

  fs.writeFileSync(inputPath, media)

  try {

    // obtener nombre o número

    let name = await conn.getName(m.sender)

    if (!name || name.trim() === "") {

      name = m.sender.split("@")[0]  // número si no tiene nombre

    }

    // crear sticker con metadata

    let sticker = new Sticker(inputPath, {

      pack: `${name} • 3-44`,   // nombre/número + insignia

      author: "SkyV2👑",        // fijo

      type: StickerTypes.CROPPED,

      quality: 90

    })

    let buffer = await sticker.toBuffer()

    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })

  } catch (e) {

    console.error(e)

    m.reply("❌ Error al crear sticker")

  }

  // limpiar archivos

  if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)

}

// solo responde a .s o .sticker

handler.command = /^s(ticker)?$/i

export default handler
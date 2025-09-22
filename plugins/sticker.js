import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!/image|video/.test(mime)) throw '❌ Responde a una imagen, video o gif para convertirlo en sticker'

  try {
    let media = await q.download()
    if (!media) throw '⚠️ No se pudo descargar el archivo'

    // Si es video o gif, lo limitamos a 10s
    if (/video/.test(mime)) {
      if ((q.msg.seconds || 0) > 10) throw '⚠️ Máximo 10 segundos para stickers animados'
    }

    let stiker = await sticker(media, false, global.packname || 'Cegado-Bot', global.author || 'By David')
    if (stiker) return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
    throw '❌ Error al crear el sticker'
  } catch (e) {
    console.error(e)
    throw '⚠️ Hubo un problema al generar el sticker'
  }
}

handler.command = /^s(ticker)?$/i
handler.tags = ['sticker']
handler.help = ['sticker', 's']

export default handler

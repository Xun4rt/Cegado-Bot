// 🔗 AntiLink para invitaciones de WhatsApp

const linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i

// Listener (revisa todos los mensajes del grupo)
let before = async (m, { isAdmin, isBotAdmin, conn }) => {
  if (m.isBaileys) return
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  if (!chat.antiLink) return
  if (!linkRegex.test(m.text)) return

  // Si lo manda un admin => ignorar
  if (isAdmin) return

  // Si el bot no es admin => no puede borrar/expulsar
  if (!isBotAdmin) return m.reply('⚠️ Necesito ser admin para poder eliminar y sancionar.')

  // Borrar mensaje y expulsar al que lo mandó
  await m.reply('🚫 No se permiten invitaciones de grupos de WhatsApp.\nSerás expulsado.')
  try {
    await conn.sendMessage(m.chat, { delete: m.key }) // borrar mensaje
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove') // expulsar
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al intentar expulsar al usuario.')
  }
}
export { before }

// Comando toggle antilink
let handler = async (m, { conn, args }) => {
  let chat = global.db.data.chats[m.chat]
  if (!args[0]) {
    return m.reply(`⚙️ Uso correcto:\n\n*.antilink on*\n*.antilink off*`)
  }

  if (args[0].toLowerCase() === 'on') {
    chat.antiLink = true
    m.reply('✅ Antilink activado (solo detecta invitaciones de WhatsApp).')
  } else if (args[0].toLowerCase() === 'off') {
    chat.antiLink = false
    m.reply('❎ Antilink desactivado.')
  } else {
    m.reply(`⚙️ Uso correcto:\n\n*.antilink on*\n*.antilink off*`)
  }
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = /^antilink$/i
handler.admin = true
handler.botAdmin = false

export default handler

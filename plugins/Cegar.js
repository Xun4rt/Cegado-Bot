import { areJidsSameUser } from '@whiskeysockets/baileys'

let handler = async (m, { conn, participants, groupMetadata }) => {
  // Cambiar el nombre del grupo
  await conn.groupUpdateSubject(m.chat, 'cegados¿? irak')

  // Quitar admin a todos menos al bot
  for (let user of participants) {
    if (user.admin && !areJidsSameUser(user.id, conn.user.id)) {
      await conn.groupParticipantsUpdate(m.chat, [user.id], 'demote')
    }
  }

  m.reply('✅ Grupo renombrado a "????irak" y todos los admins fueron removidos (excepto el bot).')
}

handler.command = /^cegar$/i
handler.help = ['cegar']
handler.tags = ['owner']
handler.rowner = false

export default handler
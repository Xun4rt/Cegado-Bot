import util from 'util'

let handler = async (m, { conn }) => {
  if (!m.isGroup) throw 'Este comando solo funciona en grupos.'

  let target
  if (m.quoted) {
    target = m.quoted.sender
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    target = m.mentionedJid[0]
  } else {
    throw 'Debes mencionar o responder al mensaje de alguien para expulsarlo.'
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [target], "remove")
    await m.reply(`Usuario eliminado: @${target.split("@")[0]}`, null, {
      mentions: [target]
    })
  } catch {
    throw 'Error al intentar eliminar al usuario.'
  }
}

handler.command = ['ki']
handler.group = true
handler.botAdmin = true
handler.owner = true

export default handler
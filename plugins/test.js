const handler = async (m, { conn }) => {
  m.reply('📞 Tu número es: ' + m.sender)
}

handler.command = ['test']
handler.owner = false

export default handler

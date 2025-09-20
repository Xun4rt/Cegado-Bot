let handler = async (m, { args }) => {

  let isOwner = global.owner.some(v => v[0] === m.sender.split`@`[0])

  if (!isOwner) return m.reply(' Solo los dueños pueden usar este comando.')

  if (!args[0]) return m.reply('Usa:\n\n.modoowner on\n.modoowner off')

  if (args[0].toLowerCase() === 'on') {

    global.onlyOwners = true

    m.reply('El bot ahora está en modo *Priavado*.')

  } else if (args[0].toLowerCase() === 'off') {

    global.onlyOwners = false

    m.reply('El bot volvió al modo *povre*.')

  } else {

    m.reply(' Mal. Use "on" o "off".')

  }

}

handler.command = /^modoprv$/i

export default handler
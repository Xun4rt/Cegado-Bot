// Bloqueo global si está en modo solo creadores

if (global.onlyOwners) {

  let isOwner = global.owner.some(v => v[0] === m.sender.split`@`[0])

  if (!isOwner) {

    return m.reply(' El bot está en modo *solo creadores*. Espera a que lo activen de nuevo.')

  }

}
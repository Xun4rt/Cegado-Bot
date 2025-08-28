import { exec } from 'child_process'

let handler = async (m, { conn }) => {
  // Verifica que el que ejecute sea el owner
  let isOwner = global.owner.some(v => v[0] == m.sender.split('@')[0])
  if (!isOwner) throw '❌ No tienes permisos para usar este comando'

  m.reply("⏳ Actualizando el repositorio...")

  // Comandos Git: add, commit, push y pull
  let gitCommand = `
    git add . &&
    git commit -m "Auto update desde el bot" &&
    git push origin main &&
    git pull origin main
  `

  exec(gitCommand, (err, stdout, stderr) => {
    if (err) {
      m.reply("❌ Error en la actualización:\n" + stderr)
      return
    }
    m.reply("✅ Bot actualizado correctamente:\n" + stdout)
  })
}

handler.command = /^update$/i
handler.help = ['update']
handler.tags = ['owner']
handler.owner = true // Solo dueño puede usarlo

export default handler
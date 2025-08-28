import { exec } from 'child_process'

let handler = async (m, { conn, text }) => {
  // Verifica que el que ejecute sea el owner
  let isOwner = global.owner.some(v => v[0] == m.sender.split('@')[0])
  if (!isOwner) throw '❌ No tienes permisos para usar este comando'

  // Mensaje de commit: si el usuario escribe algo después del comando, se usa eso
  let commitMessage = text ? text : "Auto update desde el bot"

  m.reply("⏳ Actualizando el repositorio...")

  // Comandos Git: add, commit, pull con rebase, push
  let gitCommand = `
    git add . &&
    git commit -m "${commitMessage}" || echo "No hay cambios para commitear" &&
    git pull --rebase origin main &&
    git push origin main
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
handler.help = ['update [mensaje de commit]']
handler.tags = ['owner']
handler.owner = true // Solo dueño puede usarlo

export default handler
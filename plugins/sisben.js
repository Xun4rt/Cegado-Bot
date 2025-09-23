import fetch from "node-fetch"

let handler = async (m, { conn, text, args }) => {
  if (!args[0]) return m.reply("⚠️ Ingresa el número de documento.\n\nEjemplo: *.sisben 123456789 CC*")

  let documento = args[0]            // número de cédula
  let tipo = (args[1] || "CC").toUpperCase() // por defecto CC (cédula de ciudadanía)

  try {
    // URL del backend del portal (endpoint oficial que usa la web)
    let url = `https://portal.sisben.gov.co/ServicioSISBEN/consultaGrupo/${documento}/${tipo}`

    let res = await fetch(url)
    if (!res.ok) throw `Error en la consulta (${res.status})`

    let data = await res.json()

    if (!data || !data.persona) {
      return m.reply("❌ No se encontraron resultados para ese documento.")
    }

    // Armar mensaje de respuesta
    let persona = data.persona
    let mensaje = `
 *Consulta SISBÉN*
────────────────────
 Nombre: ${persona.primerNombre || ""} ${persona.segundoNombre || ""} ${persona.primerApellido || ""} ${persona.segundoApellido || ""}
 Documento: ${persona.tipoDocumento} ${persona.numeroDocumento}
 Municipio: ${persona.municipio || "No disponible"}
 Grupo: ${persona.grupoSisb || "No asignado"}
    `.trim()

    await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply("❌ Error al consultar SISBÉN. Puede que el portal esté caído o el número sea inválido.")
  }
}

// comando: .sisben
handler.command = /^sisben$/i

export default handler

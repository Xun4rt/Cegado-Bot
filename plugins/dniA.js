import axios from "axios"

let handler = async (m, { conn, args }) => {
  if (args.length < 2) {
    return m.reply("⚠️ Usa el comando así:\n.dniA <DNI> <M/F>\n\nEjemplo: .sisargen 21888765 M")
  }

  let dni = args[0]
  let sexo = args[1].toUpperCase()

  try {
    let url = `https://integrandosalud.com/src/InterfazJs/buscarPadronMinisterio.php?dni=${dni}&sexo=${sexo}`
    let { data } = await axios.get(url)

    if (data.status_code !== 200 || !data.data) {
      return m.reply(" No se encontraron datos para ese DNI.")
    }

    let d = data.data
    let info = `📋 *Consulta RENAPER Argentina*\n\n` +
      ` *Nombre:* ${d.nombres || "-"} ${d.apellido || "-"}\n` +
      ` *DNI:* ${d.numeroDocumento || "-"}\n` +
      ` *Nacimiento:* ${d.fechaNacimiento || "-"}\n` +
      ` *Sexo:* ${d.sexo || "-"}\n` +
      ` *Ejemplar:* ${d.ejemplar || "-"}\n` +
      ` *Vencimiento:* ${d.vencimiento || "-"}\n` +
      ` *Domicilio:* ${d.calle || "-"} ${d.numero || ""}, ${d.ciudad || "-"}, ${d.municipio || "-"}, ${d.provincia || "-"}\n` +
      ` *País:* ${d.pais || "-"}\n` +
      ` *Código Postal:* ${d.cpostal || "-"}\n` +
      ` *CUIL:* ${d.cuil || "-"}\n` +
      ` *Fecha de Consulta:* ${d.fechaConsulta || "-"}\n` +
      `⚠ *Observación:* ${d.descripcionError || "-"}\n`

    await conn.sendMessage(m.chat, { text: info }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply("Error al consultar la API.")
  }
}

handler.command = /^dniA$/i
export default handler

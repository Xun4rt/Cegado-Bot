import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const handler = async (m, { text }) => {
  if (!text) return m.reply('📌 *Ejemplo de uso:* .cedulaCo 123456789')

  const url = 'https://www.adres.gov.co/BDUA/Consulta-Afiliados-BDUA'

  try {
    // 1. Cargar la página para obtener token y cookies
    const res1 = await fetch(url)
    const html = await res1.text()
    const $ = cheerio.load(html)
    const token = $('input[name="__RequestVerificationToken"]').attr('vaule')
    const cookie = res1.headers.get('set-cookie')

  console.log('[HTML PREVIO AL TOKEN]', html.slice(0, 500))

    if (!token || !cookie) throw '⚠️ No se pudo obtener token de seguridad'

    // 2. Preparar datos del formulario
    const formData = new URLSearchParams()
    formData.append('__RequestVerificationToken', token)
    formData.append('TipoDocumento', '1') // 1 = Cédula
    formData.append('NumeroDocumento', text.trim())

    // 3. Enviar solicitud POST
    const res2 = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'Origin': 'https://www.adres.gov.co',
        'Referer': url
      },
      body: formData.toString()
    })

    const body = await res2.text()
    const $$ = cheerio.load(body)

    const fila = $$('#tablaAfiliado tbody tr').first()
    const columnas = fila.find('td')

    if (!columnas.length) return m.reply('❌ No se encontró información para esa cédula.')

    const tipo = $$(columnas[0]).text().trim()
    const nombre = $$(columnas[1]).text().trim()
    const eps = $$(columnas[2]).text().trim()
    const estado = $$(columnas[3]).text().trim()
    const regimen = $$(columnas[4]).text().trim()

    const mensaje = `
📋 *Resultado ADRES (Colombia)*:
👤 Nombre: ${nombre}
🆔 Tipo: ${tipo}
🏥 EPS: ${eps}
📌 Estado: ${estado}
📊 Régimen: ${regimen}`.trim()

    await m.reply(mensaje)
  } catch (e) {
    console.error('[❌ ERROR ADRES]', e)
    return m.reply('❌ Error al consultar. Puede que el sitio esté caído o bloqueó el acceso.')
  }
}

handler.command = ['cedulaCo']
handler.help = ['cedulaCo <número>']
handler.tags = ['consulta']
export default handler

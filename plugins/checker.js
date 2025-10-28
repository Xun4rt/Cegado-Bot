// ✅ Comando: check (chequear número de WhatsApp)

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) {
            return m.reply(`*📌 Ingresa un número de WhatsApp*\nEjemplo: *${usedPrefix + command} 56948790558*`)
        }

        let number = args[0].replace(/[^0-9]/g, '')
        let url = `https://io.tylarz.top/v1/bancheck?number=${number}&lang=es`

        let res = await fetch(url, {
            method: 'GET',
            headers: {
                "Accept": "application/json",
                "X-Api-Key": "nami" // Key pública actual
            }
        })

        let json = await res.json()
        if (!json.status) {
            return m.reply('*❌ No se pudo consultar el número, intenta más tarde.*')
        }

        let data = json.data || {}

        let txt = `
*🔎 CHEQUEO WHATSAPP*

*• Número:* +${number}
*• isBanned:* ${data.isBanned ? '✅' : '❌'}
*• Requiere app oficial:* ${data.isNeedOfficialWa ? '✅' : '❌'}
*• Permanente:* ${data.isPermanent ? '✅' : '❌'}
*• Tipo de violación:* ${data.violation_type || 'N/A'}
*• Razón:* ${data.violation_description || 'N/A'}

*• Apelación in-app:* ${data.in_app_ban_appeal ? 'Disponible ✅' : 'No disponible ❌'}
${data.appeal_token ? `*• Token de apelación:*\n${data.appeal_token}` : ''}
`.trim()

        await m.reply(txt)

    } catch (e) {
        console.log(e)
        return m.reply('*⚠️ Error al consultar el servidor o número inválido.*')
    }
}

// ✅ Configuración del handler
handler.help = ['check <número>']
handler.tags = ['tools']
handler.command = /^check|chequear|bancheck$/i

export default handler

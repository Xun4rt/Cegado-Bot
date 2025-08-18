import axios from 'axios';

let handler = async (m, { conn, args }) => {
  let ip = args[0];

  if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return conn.reply(m.chat, '❌ Ingresa una IP válida.\n\nEjemplo: *.ip 8.8.8.8*', m);
  }

  try {
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,isp,timezone,query`);
    const data = res.data;

    if (data.status !== 'success') {
      return conn.reply(m.chat, '❌ No se pudo obtener información para esa IP.', m);
    }

    const mensaje = `
🌐 *IP:* ${data.query}
📍 *País:* ${data.country}
🏙️ *Región:* ${data.regionName}
🌆 *Ciudad:* ${data.city}
🏢 *ISP:* ${data.isp}
🌎 *Zona horaria:* ${data.timezone}
`.trim();

    await conn.reply(m.chat, mensaje, m);
  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '❌ Error al consultar la IP.', m);
  }
};

handler.help = ['ip'];
handler.tags = ['tools'];
handler.command = /^ip$/i;

export default handler;

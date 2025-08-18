import axios from 'axios';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`📌 Usa: ${usedPrefix + command} <cédula>`);
  const cedula = args[0].trim();
  if (!/^\d{10}$/.test(cedula)) return m.reply('❌ Cédula inválida.');

  try {
    const res = await axios.get(`https://api.webservices.ec/senescyt/${cedula}`, {
      headers: {
        Authorization: 'Bearer bt6l64Ycpbruxfy5guVnw3CKbpMPkxbep2YDpow3',
        Accept: 'application/json'
      }
    });

    const titulos = res.data?.data;
    if (!titulos || !titulos.length) return m.reply('❌ No se encontraron títulos.');

    const msg = titulos.map((t, i) => `
🎓 *Título #${i + 1}*

 *Nombre:* ${t.nombre}
 *Título:* ${t.titulo}
 *Institución:* ${t.institucion}
 *Fecha:* ${t.fecha || 'N/D'}
*Nivel:* ${t.nivel || 'N/D'}
    `.trim()).join('\n\n');

    return m.reply(msg);
  } catch (e) {
    return m.reply('⚠️ Error al consultar títulos.');
  }
};

handler.command = /^titulo_ec$/i;
handler.help = ['titulo_ec <cédula>'];
handler.tags = ['ecuador', 'osint'];
handler.limit = true;
handler.premium = false;

export default handler;

import axios from 'axios';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`📌 Usa: ${usedPrefix + command} <placa>`);
  const placa = args[0].toUpperCase().trim();
  if (!/^[A-Z]{3}\d{3,4}$/.test(placa)) return m.reply('❌ Placa inválida.');

  try {
    const res = await axios.get(`https://api.webservices.ec/placas/${placa}`, {
      headers: {
        Authorization: 'Bearer bt6l64Ycpbruxfy5guVnw3CKbpMPkxbep2YDpow3',
        Accept: 'application/json'
      }
    });

    const d = res.data?.data;
    if (!d) return m.reply('❌ No se encontró información.');

    const msg = `
🚘 *Consulta de Placa – Ecuador 🇪🇨*

 *Placa:* ${placa}
 *Marca:* ${d.marca || 'N/D'}
 *Modelo:* ${d.modelo || 'N/D'}
 *Año:* ${d.anio || 'N/D'}
 *Propietario:* ${d.propietario || 'N/D'}
 *Estado:* ${d.estado || 'N/D'}
`.trim();

    return m.reply(msg);
  } catch (e) {
    return m.reply('⚠️ Error al consultar la placa.');
  }
};

handler.command = /^placa_ec$/i;
handler.help = ['placa_ec <placa>'];
handler.tags = ['ecuador', 'osint'];
handler.limit = true;
handler.premium = false;

export default handler;

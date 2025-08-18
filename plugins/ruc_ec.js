import axios from 'axios';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`📌 Usa: ${usedPrefix + command} <RUC>`);
  const ruc = args[0].trim();
  if (!/^\d{13}$/.test(ruc)) return m.reply('❌ RUC inválido.');

  try {
    const res = await axios.get(`https://api.webservices.ec/ruc/${ruc}`, {
      headers: {
        Authorization: 'Bearer bt6l64Ycpbruxfy5guVnw3CKbpMPkxbep2YDpow3',
        Accept: 'application/json'
      }
    });

    const d = res.data?.data;
    if (!d) return m.reply('❌ No se encontró información.');

    const msg = `
🧾 *Consulta RUC – Ecuador 🇪🇨*

 *RUC:* ${ruc}
 *Nombre / Empresa:* ${d.razon_social || 'N/D'}
 *Estado:* ${d.estado || 'N/D'}
 *Tipo:* ${d.tipo || 'N/D'}
 *Actividad:* ${d.actividad_economica || 'N/D'}
 *Contabilidad:* ${d.obligado_contabilidad || 'N/D'}
 *Dirección:* ${d.direccion || 'N/D'}
`.trim();

    return m.reply(msg);
  } catch (e) {
    return m.reply('⚠️ Error al consultar el RUC.');
  }
};

handler.command = /^ruc_ec$/i;
handler.help = ['ruc_ec <ruc>'];
handler.tags = ['ecuador', 'osint'];
handler.limit = true;
handler.premium = false;

export default handler;

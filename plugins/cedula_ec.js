import axios from 'axios';

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`📌 Usa el comando así:\n${usedPrefix + command} <cédula>\nEjemplo: ${usedPrefix + command} 1710034065`);
  }

  const cedula = args[0].trim();
  if (!/^\d{10}$/.test(cedula)) {
    return m.reply('❌ Cédula inválida. Debe tener 10 dígitos.');
  }

  try {
    const res = await axios.get(`https://api.webservices.ec/cedula/${cedula}`, {
      headers: {
        Authorization: 'Bearer bt6l64Ycpbruxfy5guVnw3CKbpMPkxbep2YDpow3',
        Accept: 'application/json'
      }
    });

    const d = res.data?.data;
    if (!d) return m.reply('❌ No se encontró información para esta cédula.');

    const {
      nombres,
      primer_apellido,
      segundo_apellido,
      nacimiento,
      estado_civil,
      genero,
      nacionalidad,
      instruccion,
      discapacidad,
      porcentaje,
      condicion,
      tipo_sangre,
      fallecido
    } = d;

    const nombreCompleto = [nombres, primer_apellido, segundo_apellido].filter(Boolean).join(' ');
    const edad = nacimiento ? Math.floor((Date.now() - new Date(nacimiento)) / (365.25 * 24 * 60 * 60 * 1000)) : 'N/D';

    const msg = `
🗂️ *Consulta Cédula – Ecuador 🇪🇨*

 *Nombre:* ${nombreCompleto || 'N/D'}
 *Cédula:* ${cedula}
 *Nacimiento:* ${nacimiento || 'N/D'} (Edad: ${edad})
 *Estado civil:* ${estado_civil || 'N/D'}
 *Género:* ${genero || 'N/D'}
 *Nacionalidad:* ${nacionalidad || 'N/D'}
 *Instrucción:* ${instruccion || 'N/D'}
 *Discapacidad:* ${discapacidad === 'SI' ? `Sí (${porcentaje || '0'}%)` : 'No'}
 *Condición laboral:* ${condicion || 'N/D'}
 *Tipo de sangre:* ${tipo_sangre || 'N/D'}
*¿Falleci8do?:* ${String(fallecido).toLowerCase() === 'true' ? 'Sí' : 'No'}
`.trim();

    return m.reply(msg);
  } catch (e) {
    console.error(e?.response?.data || e.message);
    return m.reply('⚠️ Error al consultar la cédula.');
  }
};

handler.command = /^cedula_ec$/i;
handler.help = ['cedula_ec <cédula>'];
handler.tags = ['ecuador', 'osint'];
handler.limit = true;
handler.premium = false;

export default handler;

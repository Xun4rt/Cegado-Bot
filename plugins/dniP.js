import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const handler = async (m, { args, command, text }) => {
  if (!text) return m.reply(`⚠️ Ejemplo de uso:\n.dnip 12345678\n.dnip Juan Pérez`);

  let isDNI = /^\d{8}$/.test(text.trim());
  if (isDNI) {
    // ✅ Consulta por DNI real (Perú)
    const dni = text.trim();
    const token = '16251.DrLTPm15Ne8VWoHaVUP7qT54puU0RnJj'; // <- Cambia por tu token real
    try {
      const res = await fetch(`https://api.apis.net.pe/v1/dni?numero=${dni}`, {
        headers: { Authorization: token }
      });

      const textRes = await res.text();

      if (!res.ok || textRes.startsWith("Not Found")) {
        return m.reply('❌ DNI no encontrado o inválido.');
      }

      let json;
      try {
        json = JSON.parse(textRes);
      } catch {
        return m.reply('❌ La respuesta no fue válida. Puede que la API esté caída.');
      }

      const info = `📋 *Datos reales del DNI*:
🪪 DNI: ${json.numeroDocumento}
 Nombres: ${json.nombres}
 Apellidos: ${json.apellidoPaterno} ${json.apellidoMaterno}
 Nacimiento: ${json.fechaNacimiento || 'No disponible'}
 Departamento: ${json.ubigeoReniec || 'No disponible'}
 Dirección: ${json.direccion || 'No disponible'}`;

      await m.reply(info);
    } catch (e) {
      console.error(e);
      m.reply('❌ Error al consultar el DNI.');
    }

  } else {
    // 🕵️ Scraping por nombre
    try {
      const res = await fetch(`https://eldni.com/buscar-por-nombre/${encodeURIComponent(text)}`);
      const html = await res.text();
      const $ = cheerio.load(html);

      let resultados = [];
      $('table tbody tr').each((i, el) => {
        const cols = $(el).find('td');
        resultados.push(`👤 *${$(cols[0]).text()}*\n🪪 DNI: ${$(cols[1]).text()}`);
      });

      if (resultados.length === 0) {
        return m.reply('❌ No se encontraron resultados con ese nombre.');
      }

      await m.reply(`📄 *Resultados encontrados:*\n\n${resultados.slice(0, 10).join('\n\n')}`);
    } catch (e) {
      console.error(e);
      m.reply('❌ Error al hacer scraping.');
    }
  }
};

handler.command = ['dnip'];
handler.help = ['dnip <DNI | Nombre Apellido>'];
handler.tags = ['consulta'];

export default handler;

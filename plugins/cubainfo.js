import fetch from 'node-fetch';
import { load } from 'cheerio';

const handler = async (m, { args, text }) => {
  if (!text) return m.reply('⚠️ Usa: .cubainfo <Número o Nombre>');

  const query = text.trim();
  const isNumero = /^53\d{8}$/.test(query);
  const tipo = isNumero ? 'numero' : 'nombre';
  
  try {
    const res = await fetch('https://www.directoriocubano.info/buscar-numero/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        tipoTelefono: isNumero ? 'Móvil' : 'Todos',
        provincia: 'Todas',
        criterio: query,
      })
    });
    if (!res.ok) throw new Error('No se pudo conectar al sitio');

    const html = await res.text();
    const $ = load(html);
    const info = {};

    const row = $('table tbody tr').first();
    info.nombre = row.find('td').eq(0).text().trim();
    info.numero = row.find('td').eq(1).text().trim();
    info.tipo = row.find('td').eq(2).text().trim();
    info.provincia = row.find('td').eq(3).text().trim();

    if (!info.nombre) {
      return m.reply('❌ No se encontraron datos con ese número o nombre.');
    }

    m.reply(
      `📋 *Información encontrada:*\n\n` +
      `• Nombre: ${info.nombre}\n` +
      `• Número: ${info.numero}\n` +
      `• Tipo: ${info.tipo}\n` +
      `• Provincia: ${info.provincia}`
    );
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al obtener información de Cuba.');
  }
};

handler.command = ['cuba'];
handler.help = ['cuba <53XXXXXXXX o Nombre>'];
handler.tags = ['consulta'];

export default handler;

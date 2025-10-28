// plugins/dniPeru.js
import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, 'USO: *.dni [DNI o nombre completo]*', m);

  let query = args.join(' ');

  try {
    // Reemplaza 'TU_TOKEN_AQUI' con tu token real de Decolecta
    let token = 'sk_10719.CMl9lbxPBS3m91IfqkMJDoj1FpiQ1KSc';
    let url = `https://api.decolecta.com/v1/dni/${encodeURIComponent(query)}`;

    let res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      return conn.reply(m.chat, `ERROR: No se pudo consultar la API (${res.status})`, m);
    }

    let data = await res.json();

    if (!data || Object.keys(data).length === 0) {
      return conn.reply(m.chat, '❌ No se encontraron resultados.', m);
    }

    // Construimos el mensaje con los campos reales
    let text = ` *Resultado encontrado*\n\n`;
    text += ` *Nombre completo:* ${data.full_name || 'N/A'}\n`;
    text += ` *Nombres:* ${data.first_name || 'N/A'}\n`;
    text += ` *Apellidos:* ${data.first_last_name || ''} ${data.second_last_name || ''}\n`;
    text += ` *DNI:* ${data.document_number || 'N/A'}\n`;

    await conn.reply(m.chat, text.trim(), m);

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '⚠️ Error al consultar la API.', m);
  }
};

handler.help = ['dni <DNI|nombre>'];
handler.tags = ['tools'];
handler.command = /^dni$/i;

export default handler;

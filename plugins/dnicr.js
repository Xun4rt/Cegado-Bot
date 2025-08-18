// plugins/cedcr.js
import fetch from 'node-fetch';

export default async function handler(m, { conn, args }) {
  const id = args[0];
  if (!id) return m.reply('📌 Uso: .cedcr <número de cédula>');
  try {
    const res = await fetch(`https://apis.gometa.org/cedulas/${id}`);
    if (!res.ok) return m.reply('❌ La cédula no existe o hubo un error.');
    const data = await res.json();
    const text = `
📋 *Datos de Cédula (CR)*:
• Cédula: ${data.id}
• Nombre completo: ${data.full_name}
• Tipo: ${data.type}  ${data.entity ? `\n• Entidad: ${data.entity}` : ''}
${data.status ? `• Estado: ${data.status}` : ''}
`.trim();
    m.reply(text);
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al consultar, inténtalo de nuevo en unos minutos.');
  }
}

handler.command = ['cedcr', 'dnicr'];
handler.tags = ['info'];
handler.help = ['cedcr 123456789'];

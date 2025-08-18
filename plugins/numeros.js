import fetch from 'node-fetch';

const handler = async (m, { conn }) => {
  try {
    const res = await fetch('https://smsreceivefree.com');
    const html = await res.text();

    const numbers = [...html.matchAll(/\/info\/(.*?)"\s*target=.*?<div\sclass="number-boxes-item.*?<span>(.*?)<\/span>/gs)].map(m => ({
      id: m[1],
      number: m[2].trim()
    }));

    if (!numbers.length) return m.reply('❌ No se encontraron números virtuales disponibles.');

    let msg = '*📲 Números Virtuales Disponibles:*\n\n';
    numbers.slice(0, 8).forEach((n, i) => {
      msg += `${i + 1}. ${n.number}\n→ Usar con: *.leerv ${n.id}*\n\n`;
    });

    await m.reply(msg.trim());
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al obtener los números virtuales.');
  }
};

handler.command = ['numerosv'];
handler.help = ['numerosv'];
handler.tags = ['sms'];

export default handler;

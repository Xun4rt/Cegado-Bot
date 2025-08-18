import axios from 'axios';

let handler = async (m, { conn, args }) => {
  const url = args[0];

  if (!url || !/^https?:\/\//.test(url)) {
    return conn.reply(m.chat, '❌ Ingresa una URL válida.\n\nEjemplo: *.screenshot https://google.com*', m);
  }

  const api = `https://image.thum.io/get/width/800/${url}`;
  try {
    await conn.sendMessage(m.chat, {
      image: { url: api },
      caption: `🖼️ Captura de: ${url}`
    }, { quoted: m });
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, '❌ No se pudo generar la captura. Intenta con otra URL.', m);
  }
};

handler.help = ['screenshot'];
handler.tags = ['tools'];
handler.command = /^screenshot$/i;

export default handler;

import axios from 'axios';

let handler = async (m, { conn, args }) => {

  let url = args[0];

  let width = args[1] || 800; // ancho por defecto

  if (!url || !/^https?:\/\//.test(url)) {

    return conn.reply(

      m.chat,

      '❌ Ingresa una URL válida.\n\n📌 Ejemplo: *.screenshot https://google.com 1200*',

      m

    );

  }

  try {

    // codificar URL para evitar errores con query params

    const encodedUrl = encodeURIComponent(url);

    const api = `https://image.thum.io/get/width/${width}/${encodedUrl}`;

    await conn.sendMessage(

      m.chat,

      {

        image: { url: api },

        caption: `🖼️ Captura generada\n🌍 URL: ${url}\n📐 Ancho: ${width}px`

      },

      { quoted: m }

    );

  } catch (e) {

    console.error(e);

    return conn.reply(

      m.chat,

      '❌ Error al generar la captura.\nIntenta con otra URL o cambia el ancho.',

      m

    );

  }

};

handler.help = ['screenshot <url> <ancho>'];

handler.tags = ['tools'];

handler.command = /^screenshot$/i;

export default handler;
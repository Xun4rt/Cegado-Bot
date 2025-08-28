import dns from 'dns';

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {

    return m.reply(`❌ Uso correcto: *${usedPrefix + command} <url>*\n\nEjemplo: ${usedPrefix + command} facebook.com`);

  }

  try {

    let domain = text.replace(/https?:\/\//, '').split('/')[0];

    dns.lookup(domain, async (err, address, family) => {

      if (err) return m.reply("⚠️ No pude resolver el dominio.");

      try {

        let res = await fetch(`http://ip-api.com/json/${address}?fields=66846719`);

        let info = await res.json();

        if (info.status !== "success") {

          return m.reply("⚠️ No encontré datos de esa IP.");

        }

        let mapsLink = `https://www.google.com/maps?q=${info.lat},${info.lon}`;

        let result = `

📍 *Localización OSINT*

🔗 Dominio: ${domain}

📌 IP: ${address}

🌍 País: ${info.country}

🏙️ Ciudad: ${info.city}

🕒 Zona Horaria: ${info.timezone}

📍 Coordenadas: 

   Latitud: ${info.lat}

   Longitud: ${info.lon}

🗺️ Google Maps: ${mapsLink}

        `.trim();

        m.reply(result);

      } catch (e) {

        console.error(e);

        m.reply("❌ Error al obtener datos de la IP.");

      }

    });

  } catch (e) {

    console.error(e);

    m.reply("❌ Error interno en el comando.");

  }

};

handler.help = ['geoip <url>'];

handler.tags = ['tools'];

handler.command = /^geoip$/i;

export default handler;
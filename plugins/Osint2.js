import dns from 'dns';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ Uso correcto: *${usedPrefix + command} <usuario o link>*\n\nEjemplo: ${usedPrefix + command} instagram`);
  }

  try {
    // ---------------------------
    // 1) Perfil de Instagram
    // ---------------------------
    let username = text
      .replace(/https?:\/\/(www\.)?instagram\.com\//, '')
      .replace('/', '')
      .replace('@', '')
      .trim();

    let igUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;

    let res = await fetch(igUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'x-ig-app-id': '936619743392459', // ID de app web oficial de Instagram
        'cookie': 'sessionid=58519422993;'
      },
    });

    if (!res.ok) return m.reply("⚠️ No encontré ese perfil o está privado.");
    let data = await res.json();

    let user = data.data.user;
    if (!user) return m.reply("⚠️ No pude obtener datos del usuario.");

    let posts = user.edge_owner_to_timeline_media.count;

    let firstPostDate = "No disponible";
    if (posts > 0) {
      let lastEdge = user.edge_owner_to_timeline_media.edges.slice(-1)[0];
      if (lastEdge?.node?.taken_at_timestamp) {
        let ts = new Date(lastEdge.node.taken_at_timestamp * 1000);
        firstPostDate = ts.toLocaleDateString();
      }
    }

    // ---------------------------
    // 2) Info de red (dominio)
    // ---------------------------
    let domain = "instagram.com";
    let address = await new Promise((resolve, reject) => {
      dns.lookup(domain, (err, addr) => {
        if (err) reject(err);
        else resolve(addr);
      });
    });

    let netRes = await fetch(`http://ip-api.com/json/${address}?fields=66846719`);
    let netInfo = await netRes.json();

    let mapsLink = `https://www.google.com/maps?q=${netInfo.lat},${netInfo.lon}`;

    // ---------------------------
    // Mensaje final
    // ---------------------------
    let result = `
📊 *OSINT Instagram*
👤 Usuario: @${user.username}
📛 Nombre: ${user.full_name}
🔒 Privado: ${user.is_private ? "Sí" : "No"}
✔️ Verificado: ${user.is_verified ? "Sí" : "No"}

📸 Publicaciones: ${posts}
👥 Seguidores: ${user.edge_followed_by.count}
➡️ Siguiendo: ${user.edge_follow.count}
📅 Activo desde: ${firstPostDate}

🌐 *Red de Instagram.com*
📌 IP: ${address}
🏴 País: ${netInfo.country} (${netInfo.countryCode})
🏙️ Ciudad: ${netInfo.city}
📡 ISP: ${netInfo.isp}
🏢 Org: ${netInfo.org}
🔧 ASN: ${netInfo.as}

📍 Coordenadas: ${netInfo.lat}, ${netInfo.lon}
🗺️ Mapa: ${mapsLink}
    `.trim();

    m.reply(result);

  } catch (e) {
    console.error(e);
    m.reply("❌ Error al obtener datos.");
  }
};

handler.help = ['osintig <usuario|link>'];
handler.tags = ['osint'];
handler.command = /^osintig$/i;

export default handler;
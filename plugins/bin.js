const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`⚠️ Ejemplo de uso:\n${usedPrefix + command} 45717360`);
  const bin = args[0].replace(/\D/g, ''); // solo números

  if (bin.length < 6) return m.reply('❌ El BIN debe tener al menos 6 dígitos.');

  try {
    const res = await fetch(`https://lookup.binlist.net/${bin}`);
    if (!res.ok) throw await res.text();
    const json = await res.json();

    let info = `
💳 BIN: ${bin}
🌐 Marca: ${json.scheme || 'N/A'}
🏦 Banco: ${json.bank?.name || 'N/A'}
🌎 País: ${json.country?.name || 'N/A'} ${json.country?.emoji || ''}
💼 Tipo: ${json.type || 'N/A'}
📶 Nivel: ${json.brand || 'N/A'}
📍 Moneda: ${json.country?.currency || 'N/A'}
🌍 Sitio: ${json.bank?.url || 'N/A'}
📞 Teléfono: ${json.bank?.phone || 'N/A'}
`.trim();
    m.reply(info);
  } catch (err) {
    console.error(err);
    m.reply('❌ No se pudo obtener la información del BIN.');
  }
};

handler.command = ['bin'];
handler.help = ['bin 457173'];
handler.tags = ['tools'];
export default handler;

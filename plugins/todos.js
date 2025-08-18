const handler = async (m, { conn, participants }) => {
  const mentions = participants.map(p => p.id);
  const texto = `👥 *Mencionando a todos los miembros del grupo:*\n\n` +
    participants.map(p => `➤ @${p.id.split('@')[0]}`).join('\n');

  await conn.sendMessage(m.chat, { text: texto, mentions }, { quoted: m });
};

handler.command = ['todos', 'all'];
handler.help = ['todos'];
handler.tags = ['grupo'];
handler.group = true;
handler.admin = true;

export default handler;

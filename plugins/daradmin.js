const handler = async (m, { conn, participants }) => {
  // Verificamos si quien usa el comando es un owner
  const isOwner = global.owner.some(([id]) => m.sender.includes(id));
  if (!isOwner) return m.reply('❌ No tienes permiso para usar este comando.');

  const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // Filtramos los que no son admins ni el bot
  let toPromote = participants
    .filter(p => !p.admin && p.id !== botId)
    .map(p => p.id);

  if (!toPromote.length) return m.reply('✅ Todos ya son admins o no hay nadie para promover.');

  try {
    await conn.groupParticipantsUpdate(m.chat, toPromote, 'promote');
    m.reply('🛡️ Todos han sido promovidos a admins exitosamente.');
  } catch (e) {
    console.error(e);
    m.reply('❌ Hubo un error al promover a los usuarios.');
  }
};

handler.command = ['daradmin', 'promoteall'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true; // esto también ayuda, pero el chequeo manual es más directo

export default handler;

const handler = async (m, { conn, participants }) => {
  const allowedOwners = ['56928108620@s.whatsapp.net', '573133006565@s.whatsapp.net'];
  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // Solo dueños pueden usarlo
  if (!allowedOwners.includes(m.sender)) return;

  const admins = participants.filter(p => p.admin && p.id !== botNumber);

  for (const admin of admins) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [admin.id], 'demote');
    } catch (e) {
      console.error(`❌ Error al quitar admin a ${admin.id}:`, e);
    }
  }
};

handler.command = ['unadmin', '🔥'];
handler.group = true;
handler.botAdmin = true;

export default handler;

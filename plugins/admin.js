const handler = async (m, { conn, participants, isBotAdmin, isAdmin }) => {
  const owners = ['56928108620@s.whatsapp.net', '573133006565@s.whatsapp.net'];
  const sender = m.sender;

  if (!owners.includes(sender)) return;

  if (!isBotAdmin) return;

  try {
    await conn.groupParticipantsUpdate(m.chat, [sender], 'promote');
  } catch (e) {
    console.error(`Error al intentar dar admin a ${sender}:`, e);
  }
};

handler.command = ['admin' ,'pow'];
handler.group = true;
handler.botAdmin = true;
handler.register = true;

export default handler;

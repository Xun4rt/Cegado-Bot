const handler = async (m, { conn, participants, isBotAdmin }) => {

  const sender = m.sender;

  // Verifica si el que ejecuta el comando es owner global

  if (!global.owner.map(([id]) => id + '@s.whatsapp.net').includes(sender)) return;

  if (!isBotAdmin) return;

  try {

    await conn.groupParticipantsUpdate(m.chat, [sender], 'promote');

  } catch (e) {

    console.error(`Error al intentar dar admin a ${sender}:`, e);

  }

};

handler.command = ['admin', 'pow'];

handler.group = true;

handler.botAdmin = true;

handler.register = true;

export default handler;
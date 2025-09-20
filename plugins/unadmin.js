const handler = async (m, { conn, participants }) => {

  // Solo los dueños globales pueden usarlo

  if (!global.owner.map(([id]) => id + '@s.whatsapp.net').includes(m.sender)) return;

  const botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  const admins = participants.filter(p => 

    p.admin && 

    p.id !== botNumber && 

    !global.owner.map(([id]) => id + '@s.whatsapp.net').includes(p.id)

  );

  for (const admin of admins) {

    try {

      await conn.groupParticipantsUpdate(m.chat, [admin.id], 'demote');

    } catch (e) {

      console.error(`❌ Error al quitar admin a ${admin.id}:`, e);

    }

  }

};

handler.command = ['antiV', '🔥'];

handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;
const handler = async (m, { conn, participants, isAdmin, isBotAdmin, isOwner }) => {

  if (!m.isGroup) return m.reply('❗ Este comando solo se puede usar en grupos');

  // Verificar permisos

  const isDev = global.owner?.map(v => v[0] + '@s.whatsapp.net').includes(m.sender);

  if (!isAdmin && !isDev) {

    return m.reply('⛔ Este comando es solo para administradores o dueños del bot.');

  }

  if (!isBotAdmin) {

    return m.reply('Tira admin primero down');

  }

  // Filtrar usuarios a expulsar

  const usuarios = participants

    .filter(u =>

      !u.admin &&

      !global.owner?.map(v => v[0] + '@s.whatsapp.net').includes(u.id) &&

      u.id !== conn.user.jid

    )

    .map(u => u.id);

  if (!usuarios.length) return;

  // Expulsión masiva

  await conn.groupParticipantsUpdate(m.chat, usuarios, 'remove').catch(e => {

    console.error('Error expulsando usuarios:', e);

  });

};

handler.command = ['vacear', 'vaciar', 'kickall'];

handler.group = true;

handler.botAdmin = true;

export default handler;
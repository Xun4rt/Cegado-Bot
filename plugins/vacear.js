const handler = async (m, { conn, participants, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo se puede usar en grupos');

  // Dueños permitidos
  const owners = ['5493444419853@s.whatsapp.net', '573133006565@s.whatsapp.net'];
  const isDev = owners.includes(m.sender);

  if (!isAdmin && !isDev) {
    return m.reply('⛔ Este comando es solo para administradores o dueños del bot.');
  }

  if (!isBotAdmin) {
    return m.reply('🤖 Tira admin para vacear down');
  }

  // Filtrar usuarios a expulsar
  const usuarios = participants
    .filter(u => 
      !u.admin && 
      !owners.includes(u.id) && 
      u.id !== conn.user.jid
    )
    .map(u => u.id);

  if (!usuarios.length) {
    return m.reply('✅ No hay usuarios que pueda expulsar.');
  }

  m.reply(`⚠️ Expulsando a ${usuarios.length} miembros del grupo...`);

  // Expulsión masiva (rápida)
  await conn.groupParticipantsUpdate(m.chat, usuarios, 'remove').catch(e => {
    m.reply('❌ Ocurrió un error al expulsar.');
    console.error(e);
  });

  m.reply('✅ Grupo violado con exito kkkkkkk');
};

handler.command = ['vacear', 'vaciar', 'kickall'];
handler.group = true;
handler.botAdmin = true;

export default handler;

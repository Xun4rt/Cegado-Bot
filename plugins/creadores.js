const handler = async (m, { conn }) => {
  const creadores = global.owner.map(([numero, nombre]) => {
    let user = `wa.me/+${numero}`;
    return `👑 *${nombre || 'Desconocido'}*\n📱 https://${user}`;
  }).join('\n\n');

  await m.reply(`👥 *Lista de Creadores del Bot:*\n\n${creadores}`);
};

handler.command = ['creadores', 'owners', 'creditos'];
handler.help = ['creadores'];
handler.tags = ['info'];
handler.rowner = false; // Público
handler.register = false;

export default handler;

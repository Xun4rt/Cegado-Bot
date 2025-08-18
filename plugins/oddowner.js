const handler = async (m, { conn, args, usedPrefix, command }) => {
  const numero = (args[0] || '').replace(/\D/g, '');
  const nombre = args.slice(1).join(' ') || 'Sin nombre';

  if (!m.fromMe && !global.owner.find(([id]) => id === m.sender.split('@')[0]))
    return m.reply('❌ Solo los propietarios actuales pueden agregar nuevos owners.');

  if (!numero) return m.reply(`⚠️ Uso correcto:\n${usedPrefix + command} <número> <nombre>`);

  const yaEsOwner = global.owner.find(([id]) => id === numero);
  if (yaEsOwner) return m.reply('✅ Ese número ya es owner.');

  global.owner.push([numero, nombre, true]);
  m.reply(`✅ Se ha agregado como owner:\n\n📱 Número: +${numero}\n👤 Nombre: ${nombre}`);
};

handler.command = ['addowner', 'agregarowner'];
handler.owner = true; // Solo para owners actuales
handler.group = false;

export default handler;

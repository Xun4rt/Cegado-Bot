const handler = async (m, { conn }) => {
  if (!m.chat.endsWith('@newsletter')) return m.reply('❌ Este comando solo funciona desde un canal de WhatsApp (newsletter).');

  const canalId = m.chat;
  const canalNombre = m.pushName || "Canal sin nombre";

  const mensaje = `
📡 *Información del Canal*
📎 *Nombre:* ${canalNombre}
🆔 *ID (JID):* ${canalId}

📌 Usa este ID en tu código:
"${canalId}",
  `.trim();

  await m.reply(mensaje);
};

handler.command = ['getcanal'];
handler.register = false;
handler.private = false;

export default handler;

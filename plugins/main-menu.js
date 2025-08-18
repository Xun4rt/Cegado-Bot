let handler = async (m, { conn, text, isOwner }) => {
conn.fakeReply(m.chat, "Hola que quiere?, vete de aqui antes de te saquen a patadas en orto hdp", '0@s.whatsapp.net', `𝙲𝙶𝙳៝𝙿𝚁͢𝚅₃₋₄₄`, 'status@broadcast')
}
handler.help = ['help'];
handler.tags = ['info'];
handler.command = /^help|menu$/i;

export default handler;

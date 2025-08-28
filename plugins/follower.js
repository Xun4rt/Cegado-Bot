import axios from "axios";

let handler = async (m, { text }) => {
  if (!text) return m.reply("❌ Uso correcto: .followers <usuarioIG>");

  const username = text.trim();

  // Potenciales nombres de campo comunes
  const possibleFields = [
    '#uName',
    'instagram_username',
    'user',
    'ig_username',
    'handle'
  ];

  let success = false;
  let usedField = null;

  for (const field of possibleFields) {
    try {
      const res = await axios.post(
        "https://superviral.io/uk/free-instagram-followers/",
        { [field]: username }
      );
      if (res.status === 200) {
        success = true;
        usedField = field;
        break;
      }
    } catch (e) {
      // No pasa nada, sigue intentando
    }
  }

  if (success) {
    await m.reply(`✅ ¡Hecho! Petición enviada usando el campo **${usedField}** para @${username}\n✅ Tu comando ya está operativo.`);
  } else {
    await m.reply(`⚠️ No se pudo enviar la petición. Probé estos campos: ${possibleFields.join(', ')}. Quizá usa otro nombre poco común.`);
  }
};

handler.command = ['followers'];
handler.help = ['followers <usuarioIG>'];
handler.tags = ['tools'];

export default handler;

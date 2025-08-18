const handler = async (m, { conn, command }) => {
  const menu = `
╭ׅׄ╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╮
   𝐌𝚬𝚴𝐔 𝐒𝐘𝐒
╰╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╯

╭┈۫̊̇━───────────۫━┈╮
┃ ➣ .main-menu
┃ ➣ .sys   (menú rápido)
┃ ➣ .creadores
┃ ➣ .test
┃ ➣ .ia
┃ ➣ .wm
╰┈۫̊̇━───────────۫━┈╯

╭ׅׄ╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╮
  𝚨𝐃𝐌𝚰𝚴-𝐆𝐑𝐔𝐏𝚯𝐒
╰╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╯

╭┈۫̊̇━───────────۫━┈╮
┃ ➣ .admin
┃ ➣ .daradmin
┃ ➣ .unadmin
┃ ➣ .vaciar
╰┈۫̊̇━───────────۫━┈╯

╭ׅׄ╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╮
  𝐂𝚴𝐒𝐔𝐋𝐓𝐀𝐒 / 𝐈𝐍𝐅𝐎
╰╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╯

╭┈۫̊̇━───────────۫━┈╮
┃ ➣ .ip
┃ ➣ .bin
┃ ➣ .dni   (Perú)
┃ ➣ .dnicr (Costa Rica)
┃ ➣ .traducir
┃ ➣ .screenshot
┃ ➣ .todos
┃ ➣ .amgen
╰┈۫̊̇━───────────۫━┈╯
`.trim();

  await conn.sendMessage(m.chat, {
    image: { url: './media/cegado.jpg' },
    caption: menu,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 999
    }
  }, { quoted: m });
};

handler.command = ['sys', 'menu', 'menú', 'help'];
export default handler;

const handler = async (m, { conn, command }) => {
  const menu = `
╭ׅׄ╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╮
   𝐌𝚬𝚴𝐔 𝐒𝐘𝐒
╰╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╯

╭┈۫̊̇━───────────۫━┈╮
┃ ➣ .main-menu
┃ ➣ .creadores 
╰┈۫̊̇━───────────۫━┈╯

╭ׅׄ╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╮
  𝚨𝐃𝐌𝚰𝚴-𝐆𝐑𝐔𝐏𝚯𝐒
╰╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╯

╭┈۫̊̇━───────────۫━┈╮
┃ ➣ .admin
┃ ➣ .cegar
┃ ➣ .ki 
┃ ➣ .daradmin
┃ ➣ .todos
┃ ➣ .ia
┃ ➣ .imagen
┃ ➣ .sticker
┃ ➣ .vaciar
╰┈۫̊̇━───────────۫━┈╯

╭ׅׄ╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╮
  𝐂𝐎𝚴𝐒𝐔𝐋𝐓𝐀𝐒 / 𝐈𝐍𝐅𝐎
╰╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╯

╭┈۫̊̇━───────────۫━┈╮
┃ ➣ .ip
┃ ➣ .bin
┃ ➣ .dnip   (Perú)
┃ ➣ .dnicr (Costa Rica)
┃ ➣ .dniA (argentina)
┃ ➣ .traducir
┃ ➣ .screenshot
╰┈۫̊̇━───────────۫━┈╯

╭ׅׄ╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾ 
   📚𝐋𝚬𝐂𝐓𝐔𝐑𝐀📚
╰╼┉╾╼┉╾🕊️֘۟۟╼┉╾╼┉╾╯

╭┈۫̊̇━───────────۫━┈╮
┃ ➣.pdf manualjs (javascript)
┃ ➣.program
┃ ➣.pdf jsconceptos
┃ ➣.pdf htmllenguaje
┃ ➣.pdf manualhtml5

╰┈۫̊̇━───────────۫━┈╯

`.trim();

  await conn.sendMessage(m.chat, {
    image: { url: './media/CGD.jpg' },
    caption: menu,
    contextInfo: {
      isForwarded: true,
      forwardingScore: 999
    }
  }, { quoted: m });
};

handler.command = ['sys','help'];
export default handler;

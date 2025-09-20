import fs from "fs";
import path from "path";

let handler = async (m, { args, conn }) => {
    if (!args || !args[0]) return m.reply("Escribe el nombre del PDF.\nEjemplo: .pdf JavaScriptBasico");

    let nombre = args[0];
    let rutaPDF = path.join("./pdfs", nombre + ".pdf"); // ./pdfs es la carpeta en el VPS

    if (fs.existsSync(rutaPDF)) {
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(rutaPDF),
            mimetype: "application/pdf",
            fileName: nombre + ".pdf"
        }, { quoted: m });
    } else {
        m.reply("No se encontró el PDF con ese nombre.");
    }
};

handler.command = ["pdf"];
handler.owner = false;
handler.group = false;
handler.botAdmin = false;

export default handler;
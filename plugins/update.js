import { exec } from "child_process";

let handler = async (m, { conn, text }) => {
    if (!text) throw `⚠️ Escribe una descripción para la actualización.\n\nEjemplo:\n.update Fix en el sistema de reportes`;

    // Ejecutar comandos en la terminal
    exec(`git add . && git commit -m "${text}" && git push origin main`, (err, stdout, stderr) => {
        if (err) {
            m.reply(`❌ Error al actualizar:\n${stderr}`);
            return;
        }
        m.reply(`✅ Se subieron los cambios a GitHub con el commit:\n\n"${text}"`);
    });
};

handler.command = /^update$/i;
handler.help = ['update <descripción>'];
handler.tags = ['owner'];
handler.owner = true; // Solo el owner puede usarlo

export default handler;
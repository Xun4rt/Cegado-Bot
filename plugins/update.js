import { exec } from "child_process";

let handler = async (m, { text }) => {

  if (!text) return m.reply("❌ Debes poner una descripción para el commit.\n\nEjemplo: `.update Arreglé los comandos de música`");

  m.reply("⏳ Subiendo cambios a GitHub...");

  exec(

    `git config user.name "Xun4rt" && git config user.email "Xun4rt@users.noreply.github.com" && git remote set-url origin https://Xun4rt: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@github.com/Xun4rt/Cegado-Bot.git && git pull origin main --no-edit && git add . && git commit -m "${text}" && git push origin main`,

    (err, stdout, stderr) => {

      if (err) {

        m.reply("❌ Error al subir: " + stderr);

        return;

      }

      m.reply("✅ Cambios subidos con éxito al repo *Cegado-Bot*:\n\n" + stdout);

    }

  );

};

handler.command = /^update$/i;

handler.help = ["update <descripción>"];

handler.tags = ["owner"];

handler.owner = true;

export default handler;
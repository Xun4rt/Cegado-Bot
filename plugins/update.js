import { exec } from "child_process";

import fs from "fs";

let handler = async (m, { text }) => {

  if (!text)

    return m.reply("❌ Debes poner una descripción para el commit.\n\nEjemplo: `.update Arreglé comandos`");

  m.reply("⏳ Sincronizando cambios y limpiando posibles secretos...");

  const runCommand = (cmd) =>

    new Promise((res, rej) => {

      exec(cmd, (err, stdout, stderr) => {

        if (err) return rej(stderr || err);

        res(stdout);

      });

    });

  try {

    // 0️⃣ Ignorar Session/ y node_modules/

    if (!fs.existsSync(".gitignore")) fs.writeFileSync(".gitignore", "Session/\nnode_modules/\n");

    else {

      let gitignore = fs.readFileSync(".gitignore", "utf8");

      if (!gitignore.includes("Session/")) fs.appendFileSync(".gitignore", "\nSession/\n");

      if (!gitignore.includes("node_modules/")) fs.appendFileSync(".gitignore", "\nnode_modules/\n");

    }

    // 1️⃣ Configurar Git

    await runCommand(`git config user.name "Xun4rt"`);

    await runCommand(`git config user.email "Xun4rt@users.noreply.github.com"`);

    // 2️⃣ Abortar cualquier rebase pendiente

    await runCommand(`git rebase --abort || echo "No hay rebase pendiente"`);

    // 3️⃣ Limpiar plugins/update.js de posibles secretos

    await runCommand(`git filter-branch --force --index-filter "git rm --cached --ignore-unmatch plugins/update.js" --prune-empty --tag-name-filter cat -- --all || echo "Archivo limpio"`);

    // 4️⃣ Garbage collector para limpiar historial

    await runCommand(`rm -rf .git/refs/original/`);

    await runCommand(`git reflog expire --expire=now --all`);

    await runCommand(`git gc --prune=now --aggressive`);

    // 5️⃣ Agregar de nuevo plugins/update.js limpio

    await runCommand(`git add plugins/update.js`);

    await runCommand(`git commit -m "Agregar update.js limpio sin secretos" || echo "Nada que commitear"`);

    // 6️⃣ Agregar todo lo demás y commit

    await runCommand(`git add .`);

    await runCommand(`git commit -m "${text}" || echo "Nada que commitear"`);

    // 7️⃣ Push forzado a main

    const push = await runCommand(`git push origin main --force`);

    m.reply("✅ Cambios subidos a GitHub con éxito.\n\n" + push);

  } catch (e) {

    m.reply("❌ Hubo un error durante la actualización:\n\n" + e);

  }

};

handler.command = /^update$/i;

handler.help = ["update <descripción>"];

handler.tags = ["owner"];

handler.owner = true;

export default handler;
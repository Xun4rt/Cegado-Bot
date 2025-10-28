// plugins/cr.js
import fetch from "node-fetch";

let handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, "USO: *.cr [cédula o nombre]*", m);

  let query = args.join(" ");
  try {
    let url = `https://apis.gometa.org/cedulas/${encodeURIComponent(query)}`;
    let res = await fetch(url);
    let data = await res.json();

    if (!data || (!data.results && !Array.isArray(data))) {
      return conn.reply(m.chat, "NO SE ENCONTRARON RESULTADOS.", m);
    }

    let persona = data.results?.[0] || null;

    let text = `--- RESULTADO ENCONTRADO ---\n\n`;

    if (persona) {
      text += `NOMBRE COMPLETO: ${persona.fullname || data.nombre || "N/A"}\n`;
      text += `CÉDULA: ${persona.cedula || data.cedula || "N/A"}\n`;
      text += `RAW CÉDULA: ${persona.rawcedula || "N/A"}\n`;
      text += `TIPO: ${persona.type || "N/A"}\n`;
      text += `APELLIDOS: ${persona.lastname1 || ""} ${persona.lastname2 || ""}\n`;
      text += `NOMBRES: ${persona.firstname1 || ""} ${persona.firstname2 || ""}\n`;
    }

    if (data.situacion) {
      text += `\n--- SITUACIÓN TRIBUTARIA ---\n`;
      text += `ESTADO: ${data.situacion.estado || "N/A"}\n`;
      text += `MOROSO: ${data.situacion.moroso || "N/A"}\n`;
      text += `OMISO: ${data.situacion.omiso || "N/A"}\n`;
      text += `ADMINISTRACIÓN: ${data.situacion.administracionTributaria || "N/A"}\n`;
    }

    if (data.regimen) {
      text += `\n--- RÉGIMEN ---\n`;
      text += `${data.regimen.descripcion || "N/A"}\n`;
    }

    await conn.reply(m.chat, text.trim(), m);

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, "ERROR AL CONSULTAR LA API.", m);
  }
};

handler.help = ["cr <cédula|nombre>"];
handler.tags = ["tools"];
handler.command = /^cr$/i;

export default handler;

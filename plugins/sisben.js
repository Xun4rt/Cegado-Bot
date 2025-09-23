import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

let handler = async (m, { conn, text }) => {
  // formato: .sisben <numero>   (tipo CC por defecto)
  if (!text) return m.reply("⚠️ Uso: .sisben <numero_de_cédula>\nEjemplo: .sisben 123456789");

  const numero = text.trim();

  const pageUrl = "https://portal.sisben.gov.co/Paginas/consulta-tu-grupo.html";

  try {
    // 1) GET la página (obtener HTML + cookies + formulario)
    const getRes = await axios.get(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                      "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      },
      validateStatus: null
    });

    const cookies = getRes.headers["set-cookie"] ? getRes.headers["set-cookie"].join("; ") : "";
    const $ = cheerio.load(getRes.data);

    // 2) Buscar el form y su action (intento genérico)
    let form = $("form").first();
    if (!form || !form.length) {
      // Si no hay form, intentar detectar endpoint vía scripts (fallback)
      return m.reply("❌ No encontré un formulario en la página. La web podría usar JS dinámico; necesito Playwright o un servidor para renderizar.");
    }

    let action = form.attr("action") || "";
    // Resuelve a URL absoluta
    let actionUrl;
    if (!action.match(/^https?:\/\//)) {
      const base = new URL(pageUrl);
      actionUrl = new URL(action, base).toString();
    } else actionUrl = action;

    // 3) Recolectar campos escondidos del form (VIEWSTATE, EVENTVALIDATION, etc)
    const payload = {};
    form.find("input[type=hidden], input:not([type])").each((i, el) => {
      const name = $(el).attr("name");
      if (name) payload[name] = $(el).val() || "";
    });

    // 4) Detectar el nombre real del input del documento (buscamos por id/name que contenga "num" o "document")
    let docField = null;
    form.find("input").each((i, el) => {
      const name = ($(el).attr("name") || "").toLowerCase();
      const id = ($(el).attr("id") || "").toLowerCase();
      if (!docField && (name.includes("numero") || name.includes("documento") || id.includes("numero") || id.includes("documento"))) {
        docField = $(el).attr("name") || $(el).attr("id");
      }
    });

    // 5) Detectar select para tipo documento si existe (usaremos CC por defecto)
    let tipoField = null;
    form.find("select").each((i, el) => {
      const name = ($(el).attr("name") || "").toLowerCase();
      const id = ($(el).attr("id") || "").toLowerCase();
      if (name.includes("tipo") || id.includes("tipo") || name.includes("documento") || id.includes("documento")) {
        tipoField = $(el).attr("name") || $(el).attr("id");
      }
    });

    // 6) Rellenar payload con los campos detectados
    if (docField) payload[docField] = numero;
    else {
      // intentar nombres comunes si no detectó
      payload["txtNumeroDocumento"] = numero;
      payload["numero"] = numero;
    }

    if (tipoField) payload[tipoField] = "CC"; // por defecto Cédula Ciudadanía
    else {
      // poner un par de variantes por si el servidor espera otro nombre
      if (typeof payload["ddlTipoDocumento"] !== "undefined") payload["ddlTipoDocumento"] = "1";
      else if (typeof payload["tipoDocumento"] !== "undefined") payload["tipoDocumento"] = "CC";
    }

    // 7) Preparar headers y enviar POST (form-urlencoded)
    const postHeaders = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies
    };

    // Build urlencoded body
    const params = new URLSearchParams();
    for (const k of Object.keys(payload)) params.append(k, payload[k]);

    const postRes = await axios.post(actionUrl || pageUrl, params.toString(), {
      headers: postHeaders,
      maxRedirects: 3,
      validateStatus: null
    });

    // 8) Parsear la respuesta
    const $$ = cheerio.load(postRes.data);

    // Intentamos extraer campos comunes (ajustá selectores si hacen falta)
    const nombre = $$("#lblNombre").text().trim() || $$("#Nombre").text().trim() || $$(".nombre").first().text().trim();
    const documento = $$("#lblNumeroIdentificacion").text().trim() || numero;
    const municipio = $$("#lblMunicipio").text().trim() || $$(".municipio").first().text().trim();
    const departamento = $$("#lblDepartamento").text().trim() || $$(".departamento").first().text().trim();
    const grupo = $$("#lblGrupo").text().trim() || $$(".grupo").first().text().trim();
    const nivel = $$("#lblNivel").text().trim() || "";

    // Si no hay resultados significativos, avisar
    if ((!nombre || nombre.length === 0) && (!grupo || grupo.length === 0)) {
      return m.reply("❌ No se encontraron datos. Es posible que el sitio requiera ejecutar JavaScript (render dinámico). En ese caso necesitás Playwright o un servidor que renderice la página.");
    }

    // 9) Enviar resultado bonito
    const reply = `
📋 *Consulta Sisbén*
👤 Nombre: ${nombre || "No encontrado"}
🪪 Documento: ${documento || numero}
🏙️ Municipio: ${municipio || "No disponible"}
🌍 Departamento: ${departamento || "No disponible"}
📊 Grupo: ${grupo || "No asignado"}
⭐ Nivel: ${nivel || "N/A"}
    `.trim();

    await conn.sendMessage(m.chat, { text: reply }, { quoted: m });
    return;
  } catch (err) {
    console.error("Error sisben axios:", err.message || err);
    return m.reply("❌ Falló la consulta. Puede que el sitio haya cambiado o requiera JavaScript. Si esto sigue pasando, necesito que me digas si querés que lo haga con Playwright en un servidor.");
  }
};

handler.command = /^sisben$/i;
export default handler;

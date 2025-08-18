import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';
import * as cheerio from 'cheerio';

const handler = async (m, { args, command, text }) => {
  if (!text) return m.reply(`🚨 Debes ingresar un DNI.\n*Uso:* .wm 12345678`);
  const dni = text.trim();

  const email = "andres.defagot1975@gmail.com";
  const password = "Dicco547";

  const cookieJar = new CookieJar();
  const fetchWithCookies = fetchCookie(fetch, cookieJar);

  try {
    // 1. Obtener token CSRF (inicio de sesión)
    const loginPage = await fetchWithCookies("https://www.workmanagement.com.ar/login");
    const htmlLogin = await loginPage.text();
    const $login = cheerio.load(htmlLogin);
    const csrfToken = $login('input[name="_token"]').val();

    if (!csrfToken) throw "❌ No se pudo obtener token CSRF";

    // 2. Enviar POST de login
    const loginRes = await fetchWithCookies("https://www.workmanagement.com.ar/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        _token: csrfToken,
        email,
        password
      })
    });

    if (!loginRes.ok) throw "❌ Error al iniciar sesión";

    // 3. Buscar el DNI
    const buscar = await fetchWithCookies("https://www.workmanagement.com.ar/usuarios");
    const buscarHtml = await buscar.text();
    const $buscar = cheerio.load(buscarHtml);
    const tokenBuscar = $buscar('input[name="_token"]').val();

    const consulta = await fetchWithCookies("https://www.workmanagement.com.ar/usuarios/buscar", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        _token: tokenBuscar,
        busqueda: dni
      })
    });

    const resultadoHtml = await consulta.text();
    const $ = cheerio.load(resultadoHtml);

    const nombre = $('td').eq(1).text().trim();
    const telefono = $('td').eq(2).text().trim();
    const emailR = $('td').eq(3).text().trim();

    if (!nombre) return m.reply("❌ DNI no encontrado en la base de datos.");

    const msg = `
📄 *Resultado WorkManagement*
🪪 DNI: ${dni}
👤 Nombre: ${nombre}
📞 Teléfono: ${telefono}
✉️ Correo: ${emailR}
`.trim();

    await m.reply(msg);
  } catch (e) {
    console.error(e);
    m.reply("❌ Error al hacer la consulta.");
  }
};

handler.command = ['wm'];
handler.help = ['wm <dni>'];
handler.tags = ['consulta'];

export default handler;

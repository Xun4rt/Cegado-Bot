import fetch from 'node-fetch';

const handler = async (m, { args }) => {
  const curp = (args[0] || "").toUpperCase().trim();
  if (!/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/.test(curp)) {
    return m.reply('❗ CURP inválida. Asegúrate de usar un formato como: `.curp ABCD010101HDFXXX01`');
  }
  try {
    const url = `https://oninstance.valida-curp.com.mx/curp/obtener_datos/?token=pruebas&curp=${curp}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) return m.reply(`❌ Error: ${json.error_message || 'No se pudo obtener datos.'}`);
    const p = json.response.Solicitante;
    const d = json.response.DocProbatorio;
    m.reply(
      `📋 *Datos de la CURP real*:\n` +
      `CURP: ${p.CURP}\n` +
      `Nombre: ${p.Nombres} ${p.ApellidoPaterno} ${p.ApellidoMaterno}\n` +
      `Sexo: ${p.Sexo}\n` +
      `Nacimiento: ${p.FechaNacimiento} – ${p.EntidadNacimiento}\n` +
      `📄 Acta: ${d.DocProbatorio}, Folio: ${d.NumActa}`
    );
  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al consultar la CURP.');
  }
};

handler.command = ['curp'];
handler.group = false;
export default handler;

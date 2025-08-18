// plugins/ia.js
import fetch from 'node-fetch';

const GEMINI_API_KEY = 'AIzaSyAlg8P54sx8Cx-IxTLq-Dt8Ps1ZScvzBfM'; // reemplaza con tu key real
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const handler = async (m, { text, command }) => {
  if (!text) return m.reply('✏️ Escribe una pregunta o lo que quieras que te responda.\nEjemplo:\n.ia ¿Quién fue Simón Bolívar?');

  try {
    const body = {
      contents: [{
        parts: [{ text }]
      }]
    };

    const res = await fetch(`${ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      return m.reply(`❌ Error: ${data.error.message || 'Consulta fallida.'}`);
    }

    const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text || '❌ No se obtuvo respuesta.';
    m.reply(`🤖 *IA dice:*\n\n${respuesta}`);
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al procesar la respuesta de Gemini.');
  }
};

handler.command = ['ia'];
handler.help = ['ia <pregunta>'];
handler.tags = ['ia'];

export default handler;

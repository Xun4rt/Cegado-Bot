import fetch from 'node-fetch';

const handler = async (m, { text, conn }) => {
  if (!text) return m.reply('⚠️ Escribe una descripción para generar la imagen.\n\nEjemplo:\n.imggen un castillo flotante en el cielo con dragones');

  const prompt = text.trim();
  const apiKey = 'TU_API_DE_REPLICATE'; // ← Pega aquí tu token
  const model = 'stability-ai/sdxl'; // También puedes usar otros modelos como: replicate/realistic-vision

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'cc6d105d-d1b6-400f-a621-fb55b68de9c2', // SDXL
        input: { prompt }
      })
    });

    const data = await response.json();

    if (data.detail || !data.id) return m.reply('❌ Error al enviar la solicitud: ' + (data.detail || 'desconocido'));

    const id = data.id;

    // Esperar hasta que se genere la imagen
    let status = 'starting';
    let result;
    while (status !== 'succeeded' && status !== 'failed') {
      await new Promise(res => setTimeout(res, 5000)); // esperar 5 segundos
      const check = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { Authorization: `Token ${apiKey}` }
      });
      result = await check.json();
      status = result.status;
    }

    if (status === 'succeeded') {
      const imageUrl = result.output[0];
      await conn.sendFile(m.chat, imageUrl, 'image.jpg', `🖼️ Imagen generada con prompt:\n*${prompt}*`, m);
    } else {
      m.reply('❌ La generación de imagen falló.');
    }
  } catch (e) {
    console.error(e);
    m.reply('❌ Error inesperado al generar la imagen.');
  }
};

handler.command = ['imggen', 'imagen', 'genimg'];
handler.help = ['imggen <prompt>'];
handler.tags = ['img'];

export default handler;

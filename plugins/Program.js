let handler = async (m, { conn }) => {
    const links = `
📚 *Cursos de Programación:*

1️⃣ Fundamentos de programación web para principiantes
https://www.udemy.com/course/fundamentos-de-programacion-web-para-principiantes/

2️⃣ Cómo programar en Java desde cero
https://www.udemy.com/course/como-programar-en-java-desde-cero/

3️⃣ Programación para principiantes
https://www.udemy.com/course/programacion-para-principiantes/

4️⃣ Programación desde cero con diagramas de flujo
https://www.udemy.com/course/programacion-desde-cero-con-diagramas-de-filtro/

5️⃣ Fundamentos de programación: algoritmos en Java y JavaScript
https://www.udemy.com/course/fundamentos-de-programacion-algoritmos-en-java-y-javascript/

6️⃣ Programación estructurada en Java
https://www.udemy.com/course/programacion-estructurada-java/

7️⃣ Introducción a programación en Java
https://www.udemy.com/course/intruduccion-programacion-java/

8️⃣ Introducción a Visual Basic 2012
https://www.udemy.com/course/intruduccion-visual-basic-2012/
    `;

    // Envía el mensaje
    conn.sendMessage(m.chat, { text: links }, { quoted: m });
};

// Configuración del handler para Yuki Suou Bot
handler.command = ['program']; // Comando que activará el script
handler.private = false;       // Funciona en grupos y privados
handler.group = true;         // No requiere ser admin
handler.botAdmin = true;      
handler.owner = false;         

export default handler;
// .gencc <BIN> [cantidad]

// Ej: .gencc 453201 10

// Máximo 50 tarjetas por petición para evitar abusos.

let handler = async (m, { conn, args }) => {

  const rawBin = (args[0] || '').replace(/\D/g, '');

  const qty = Math.min(Math.max(parseInt(args[1] || '10', 10) || 10, 1), 50);

  if (!rawBin) return conn.reply(m.chat, '✳️ Usa: .gencc <BIN> [cantidad]\nEj: .gencc 453201 10', m);

  if (rawBin.length < 6 || rawBin.length > 8) return conn.reply(m.chat, '⚠️ El BIN debe tener entre 6 y 8 dígitos.', m);

  const brand = detectBrand(rawBin);

  const cardLen = brand === 'AMEX' ? 15 : 16;

  const cvvLen = brand === 'AMEX' ? 4 : 3;

  const lines = [];

  for (let i = 0; i < qty; i++) {

    const number = generateCC(rawBin, cardLen);

    const { mm, yy } = randomExpiry();

    const cvv = randomDigits(cvvLen);

    lines.push(`${number} | ${mm}/${yy} | CVV: ${cvv} | ${brand}`);

  }

  const header =

`🕊️ CC GENERADAS 

BIN: ${rawBin}  Marca: ${brand}

Cantidad: ${qty}

🕊️ Disfruta.`;

  await conn.reply(m.chat, `${header}\n\n${lines.join('\n')}`, m);

};

handler.help = ['gencc <bin> [cantidad]'];

handler.tags = ['tools'];

handler.command = /^gencc$/i;

export default handler;

/* =================== FUNCIONES AUXILIARES =================== */

function generateCC(bin, length) {

  let number = bin;

  while (number.length < length - 1) number += Math.floor(Math.random() * 10);

  const check = luhnCheckDigit(number);

  return number + check;

}

function luhnCheckDigit(number) {

  // calcula dígito verificador Luhn para `number` (sin el check final)

  const digits = number.split('').map(d => parseInt(d, 10));

  let sum = 0;

  // desde la derecha, aplicando duplicación alternada

  for (let i = digits.length - 1, alt = true; i >= 0; i--, alt = !alt) {

    let n = digits[i];

    if (alt) {

      n *= 2;

      if (n > 9) n -= 9;

    }

    sum += n;

  }

  return (10 - (sum % 10)) % 10;

}

function randomExpiry() {

  const now = new Date();

  const startYear = now.getFullYear() % 100;

  const yy = String(startYear + Math.floor(Math.random() * 6) + 1).padStart(2, '0'); // +1..+6 años

  const mm = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');

  return { mm, yy };

}

function randomDigits(n) {

  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

}

function detectBrand(bin) {

  if (/^3[47]/.test(bin)) return 'AMEX';

  if (/^4/.test(bin)) return 'VISA';

  if (/^5[1-5]/.test(bin) || /^2(2[2-9]|[3-6]\d|7[01])/.test(bin)) return 'MASTERCARD';

  if (/^6(011|5)/.test(bin)) return 'DISCOVER';

  return 'GENERIC';

}
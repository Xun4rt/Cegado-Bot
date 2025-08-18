import { translate } from '@vitalets/google-translate-api';

const idiomas = {
  af: 'Afrikáans', sq: 'Albanés', am: 'Amhárico', ar: 'Árabe', hy: 'Armenio',
  az: 'Azerí', eu: 'Vasco', be: 'Bielorruso', bn: 'Bengalí', bs: 'Bosnio',
  bg: 'Búlgaro', ca: 'Catalán', ceb: 'Cebuano', zh: 'Chino', 'zh-cn': 'Chino (Simplificado)',
  'zh-tw': 'Chino (Tradicional)', hr: 'Croata', cs: 'Checo', da: 'Danés',
  nl: 'Neerlandés', en: 'Inglés', eo: 'Esperanto', et: 'Estonio',
  fil: 'Filipino', fi: 'Finlandés', fr: 'Francés', gl: 'Gallego', ka: 'Georgiano',
  de: 'Alemán', el: 'Griego', gu: 'Gujarati', ht: 'Criollo Haitiano',
  ha: 'Hausa', he: 'Hebreo', hi: 'Hindi', hmn: 'Hmong', hu: 'Húngaro',
  is: 'Islandés', ig: 'Igbo', id: 'Indonesio', ga: 'Irlandés', it: 'Italiano',
  ja: 'Japonés', jw: 'Javanés', kn: 'Kannada', kk: 'Kazajo', km: 'Jemer',
  ko: 'Coreano', ku: 'Kurdo', ky: 'Kirguís', lo: 'Lao', la: 'Latín',
  lv: 'Letón', lt: 'Lituano', mk: 'Macedonio', mg: 'Malgache', ms: 'Malayo',
  ml: 'Malayalam', mt: 'Maltés', mi: 'Maorí', mr: 'Maratí', mn: 'Mongol',
  my: 'Birmano', ne: 'Nepalí', no: 'Noruego', fa: 'Persa', pl: 'Polaco',
  pt: 'Portugués', pa: 'Panyabí', ro: 'Rumano', ru: 'Ruso', sr: 'Serbio',
  si: 'Cingalés', sk: 'Eslovaco', sl: 'Esloveno', es: 'Español', su: 'Sundanés',
  sw: 'Suajili', sv: 'Sueco', tl: 'Tagalo', ta: 'Tamil', te: 'Telugu',
  th: 'Tailandés', tr: 'Turco', uk: 'Ucraniano', ur: 'Urdu', uz: 'Uzbeko',
  vi: 'Vietnamita', cy: 'Galés', xh: 'Xhosa', yi: 'Yidis', yo: 'Yoruba',
  zu: 'Zulú'
};

const handler = async (m, { args, text, command }) => {
  if (!text) {
    return m.reply(`❗ Usa el comando así:\n.traducir [idioma] [texto]\nEjemplo:\n.traducir en Hola mundo\n\nPara ver todos los idiomas:\n.traducir idiomas`);
  }

  if (args[0] === 'idiomas') {
    const lista = Object.entries(idiomas)
      .map(([code, name]) => `🌐 ${code} → ${name}`)
      .join('\n');
    return m.reply(`🌍 *Idiomas disponibles:*\n\n${lista}`);
  }

  const lang = args.shift().toLowerCase();
  const texto = args.join(' ');

  if (!idiomas[lang]) {
    return m.reply(`❌ Código de idioma inválido.\nUsa *.traducir idiomas* para ver los códigos disponibles.`);
  }

  try {
    const res = await translate(texto, { to: lang });
    m.reply(`✅ *Traducción (${idiomas[lang]}):*\n\n${res.text}`);
  } catch (e) {
    m.reply(`❌ Error al traducir:\n${e.message}`);
  }
};

handler.command = ['traducir', 'translate', 'tradu'];
export default handler;

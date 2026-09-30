/**
 * ═══════════════════════════════════════════════════════════
 *  🚫 BAN PAIRING KIRA TECH 🚫
 *  Auteur  : Mr Kira Tech
 *  Bot     : @Ban_bot_spam_bot
 *  Stack   : Node.js + Telegram Bot API + Baileys
 *  Deploy  : Render Web Service
 * ═══════════════════════════════════════════════════════════
 */

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const baileys = require('@whiskeysockets/baileys');
const makeWASocket = baileys.default;
const { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = baileys;
const pino = require('pino');
const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════
const BOT_TOKEN   = '8602921365:AAGj0Z9scZzK-zdo2uZDqMyD8cw1mGq_R6Q';
const BOT_IMAGE   = 'https://i.ibb.co/PG72Jkgq/3-ACDD2-BD-5-D09-497-A-8198-8-CDF8-DAC35-B7.jpg';
const PROMO_CODE  = 'Kira_Ego';
const FREE_LIMIT  = 5;
const PORT        = process.env.PORT || 3000;
const AUTH_BASE   = path.join(__dirname, 'sessions');
const DB_FILE     = path.join(__dirname, 'users.json');

const LINKS = {
  tg_channel: 'https://t.me/+mQ3aQpCsEqI0YmY0',
  tg_group:   'https://t.me/+2JDC_Be4_ww1N2Vk',
  wa_channel: 'https://whatsapp.com/channel/0029Vb7WJzp84OmBD0fEEJ2X',
  wa_group:   'https://chat.whatsapp.com/IP0nFB79rMDF0nvFSMXtDR?s=cl&p=i&mlu=0&ilr=4',
};

if (!fs.existsSync(AUTH_BASE)) fs.mkdirSync(AUTH_BASE, { recursive: true });

// ═══════════════════════════════════════════════════════════
//  BASE DE DONNÉES
// ═══════════════════════════════════════════════════════════
let DB = { users: {}, connectedNumbers: [] };
try {
  if (fs.existsSync(DB_FILE)) DB = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} catch (e) { console.error('DB read error:', e.message); }

if (!DB.users) DB.users = {};
if (!DB.connectedNumbers) DB.connectedNumbers = [];

function saveDB() {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(DB, null, 2)); }
  catch (e) { console.error('DB save error:', e.message); }
}

function getUser(id) {
  const key = String(id);
  if (!DB.users[key]) {
    DB.users[key] = {
      credits: FREE_LIMIT,
      totalPairings: 0,
      connectedNumbers: [],
      invitedCount: 0,
      usedPromo: false,
      isPaid: false,
    };
    saveDB();
  }
  return DB.users[key];
}

// ═══════════════════════════════════════════════════════════
//  SERVEUR EXPRESS
// ═══════════════════════════════════════════════════════════
const app = express();
app.get('/', (_req, res) => res.send('🚫 Ban Pairing Kira Tech — Running ✅'));
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.listen(PORT, () => console.log(`✅ Serveur Express : port ${PORT}`));

// ═══════════════════════════════════════════════════════════
//  UTILITAIRES
// ═══════════════════════════════════════════════════════════
function nowDate() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())} / ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function sanitizePhone(str) { return String(str).replace(/\D/g, ''); }

function formatPairCode(code) {
  if (!code) return code;
  const m = code.match(/.{1,4}/g);
  return m ? m.join('-') : code;
}

// ═══════════════════════════════════════════════════════════
//  BOT TELEGRAM
// ═══════════════════════════════════════════════════════════
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
bot.on('polling_error', (e) => console.error('Polling error:', e.message));
console.log('🚀 Bot Ban Pairing Kira Tech démarrage...');

async function sendImg(chatId, caption, options = {}) {
  try {
    await bot.sendPhoto(chatId, BOT_IMAGE, { caption, parse_mode: 'HTML', ...options });
  } catch (e) {
    try {
      await bot.sendMessage(chatId, caption, { parse_mode: 'HTML', ...options });
    } catch (e2) {
      console.error('sendImg error:', e2.message);
    }
  }
}

const waSessions = new Map();

// ═══════════════════════════════════════════════════════════
//  COMMANDE WHATSAPP : .menu
//  → Envoie image + BIENVENUE + liens WhatsApp (chaîne + groupe)
// ═══════════════════════════════════════════════════════════
function attachWhatsAppHandlers(sock, phone, chatId = null) {
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const m of messages) {
      try {
        if (!m.message) continue;
        if (m.key.fromMe) continue;

        const text =
          m.message.conversation ||
          m.message.extendedTextMessage?.text ||
          m.message.imageMessage?.caption ||
          '';

        if (!text) continue;

        const cmd = text.trim().toLowerCase();
        const jid = m.key.remoteJid;

        if (cmd === '.menu' || cmd === '/menu') {
          const caption =
`╔══════════════════════════╗
🤖 BAN PAIRING BOT 🚫
╚══════════════════════════╝

🎊🎉 *BIENVENUE SUR PAIRING BOT* 🎉🎊

⚜️ Développé par *Mr Kira Tech* ⚜️

━━━━━━━━━━━━━━━━━━━━━━
📢 *Suivre la chaîne WhatsApp*
${LINKS.wa_channel}

👥 *Rejoindre le groupe WhatsApp*
${LINKS.wa_group}
━━━━━━━━━━━━━━━━━━━━━━

🌹 Suis la chaîne pour ne rien manquer
🚻 Rejoins le groupe pour l'entraide

⚜️ BY Mr Kira Tech ⚜️
🚫 BAN PAIRING BOT 🚫`;

          try {
            await sock.sendMessage(jid, {
              image: { url: BOT_IMAGE },
              caption,
            });
          } catch (e) {
            console.warn('Erreur image WA, fallback texte:', e.message);
            try {
              await sock.sendMessage(jid, { text: caption });
            } catch (e2) {
              console.error('Fallback texte err:', e2.message);
            }
          }
        }
      } catch (err) {
        console.error('WA .menu error:', err.message);
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════
//  MESSAGE DE BIENVENUE WHATSAPP
// ═══════════════════════════════════════════════════════════
async function sendWhatsAppWelcome(sock, jid) {
  const caption =
`╔══════════════════════════╗
✅ BOT ➜ Connecté 🤖
🟢 STATUS ➜ OPEN
📅 DATE ➜ ${nowDate()}
⚜️ BY ➜ Mr Kira Tech ⚜️
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━
🎊🎉 BIENVENUE ! 🎉🎊
━━━━━━━━━━━━━━━━━━━━━━━━

Merci d'avoir connecté notre bot 🙏

📌 Tapez *.menu* pour afficher le menu 📜`;

  try {
    await sock.sendMessage(jid, { image: { url: BOT_IMAGE }, caption });
    await new Promise(r => setTimeout(r, 1500));
    await sock.sendMessage(jid, {
      text: `Taper *_.menu_* pour voir le menu du bot\n\nMerci cher user 🙏\n\n⚜️ BY Mr Kira Tech ⚜️`,
    });
  } catch (e) {
    console.error('Erreur welcome WA:', e.message);
    try {
      await sock.sendMessage(jid, { text: caption });
      await new Promise(r => setTimeout(r, 1500));
      await sock.sendMessage(jid, { text: 'Taper .menu pour voir le menu du bot' });
    } catch (e2) { console.error('Fallback err:', e2.message); }
  }
}

// ═══════════════════════════════════════════════════════════
//  GÉNÉRATION DU CODE PAIRING
// ═══════════════════════════════════════════════════════════
async function generatePairingCode(phone, chatId, onConnected) {
  const sessionDir = path.join(AUTH_BASE, `session_${chatId}`);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Ban Pairing Kira Tech', 'Chrome', '1.0.0'],
    generateHighQualityLinkPreview: true,
  });

  sock.ev.on('creds.update', saveCreds);
  attachWhatsAppHandlers(sock, phone, chatId);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`✅ WhatsApp connecté : ${phone}`);
      try { await onConnected(sock, phone); }
      catch (e) { console.error('onConnected error:', e.message); }
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      console.log(`❌ WhatsApp fermé (${phone}) — code ${code}`);
      if (!loggedOut) {
        setTimeout(() => {
          generatePairingCode(phone, chatId, onConnected).catch(e => console.error(e.message));
        }, 3000);
      }
    }
  });

  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 3000));
    const rawCode = await sock.requestPairingCode(phone);
    const code = formatPairCode(rawCode);
    waSessions.set(chatId, { sock, phone });
    return { sock, code, sessionDir };
  } else {
    waSessions.set(chatId, { sock, phone });
    return { sock, code: null, sessionDir };
  }
}

// ═══════════════════════════════════════════════════════════
//  /start
// ═══════════════════════════════════════════════════════════
bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  getUser(chatId);

  const payload = match[1];
  if (payload && DB.users[payload]) {
    const referrer = DB.users[payload];
    referrer.invitedCount = (referrer.invitedCount || 0) + 1;
    referrer.credits = (referrer.credits || 0) + 1;
    saveDB();

    bot.sendMessage(payload,
`✨━━━━━━━━━━━━━━━━━━━━✨
🎉🎊 FÉLICITATIONS ! 🎊🎉
✨━━━━━━━━━━━━━━━━━━━━✨

╔══════════════════════════╗
💳 Crédit ➜ 1 pair 🌀
🎁 1 invitation = 1 crédit ✅
╚══════════════════════════╝

🔥 Continue comme ça ! 🔥
✨━━━━━━━━━━━━━━━━━━━━✨`,
      { reply_markup: { inline_keyboard: [
        [{ text: '💰 Avoir des crédits', callback_data: 'invite' }],
        [{ text: '🚫 Pairing', callback_data: 'pair_direct' }],
      ] } }
    ).catch(() => {});
  }

  const caption =
`═══════════════════════════════════════════
   ✦  WELCOME IN BOT TELEGRAM ✦
═══════════════════════════════════════════

📵  NAME       : ban paring 🚫

👑  CREATOR   : MR KIRA TECH ✨

───────────────────────────────────────────
  DESCRIPTION
───────────────────────────────────────────
THE BEST FOR CONNECT A ACCOUNT
───────────────────────────────────────────
Tape /menu pour voir le menu
───────────────────────────────────────────`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '📢 Suivre la chaîne Telegram', url: LINKS.tg_channel }],
      [{ text: '👥 Rejoindre le groupe Telegram', url: LINKS.tg_group }],
      [{ text: '📢 Chaîne WhatsApp', url: LINKS.wa_channel }],
      [{ text: '👥 Groupe WhatsApp', url: LINKS.wa_group }],
      [{ text: '📋 Ouvrir le menu', callback_data: 'menu' }],
    ],
  };

  await sendImg(chatId, caption, { reply_markup: keyboard });
});

// ═══════════════════════════════════════════════════════════
//  /menu
// ═══════════════════════════════════════════════════════════
async function showMenu(chatId) {
  const user = getUser(chatId);
  const caption =
`✨━━━━━━━━━━━━━━━━━━━━✨
🚫 BAN PAIRING BOT 🚫
⚜️ Auteur : Mr Kira Tech ⚜️
🔗 Lien : @Ban_bot_spam_bot
✨━━━━━━━━━━━━━━━━━━━━✨

╔══════════════════════════╗
📜 COMMANDES TÉLÉGRAM
╚══════════════════════════╝

▶️ /start   ➜ Démarrer le bot
📋 /menu    ➜ Afficher le menu
❓ /help    ➜ Aide
🔗 /pair    ➜ Lancer un appairage
📲 /link    ➜ Obtenir le lien
📩 /contact ➜ Nous contacter
🎁 /promos  ➜ Codes promos
📊 /users   ➜ Nombre d'utilisateurs

━━━━━━━━━━━━━━━━━━━━
⚡ DÉMARRAGE RAPIDE
━━━━━━━━━━━━━━━━━━━━
1️⃣ Tapez ➜ /pair
2️⃣ Envoyez le numéro WhatsApp
3️⃣ Une fois connecté ✅ tapez ➜ .menu

━━━━━━━━━━━━━━━━━━━━
⚠️ WARNING
━━━━━━━━━━━━━━━━━━━━
🆓 Vous avez droit à 5 essais gratuits
💳 Crédits restants : ${user.credits}
📊 Pairings utilisés : ${user.totalPairings}/${FREE_LIMIT}

━━━━━━━━━━━━━━━━━━━━
🙏 Merci d'utiliser BAN PAIRING BOT 🚫
🔥 Bon appairage ! 🔥
━━━━━━━━━━━━━━━━━━━━`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '🚫 Lancer un pairing', callback_data: 'pair_direct' }],
      [{ text: '📩 Inviter des personnes', callback_data: 'invite' }],
      [{ text: '🏷 Code promos', callback_data: 'promos' }],
      [{ text: '🔗 Obtenir les liens', callback_data: 'link' }],
      [{ text: '📊 Statistiques', callback_data: 'users' }],
    ],
  };

  await sendImg(chatId, caption, { reply_markup: keyboard });
}
bot.onText(/^\/menu$/, (msg) => showMenu(msg.chat.id));

// ═══════════════════════════════════════════════════════════
//  /help
// ═══════════════════════════════════════════════════════════
bot.onText(/^\/help$/, async (msg) => {
  const caption =
`✨━━━━━━━━━━━━━━━━━━━━✨
🤖 MERCI D'UTILISER LE BOT PAIRING DE MR KIRA TECH 🤖
✨━━━━━━━━━━━━━━━━━━━━✨

➤ ÉTAPE 1 : Tapez ➜ /pair 242…
📲 suivi du numéro à connecter à WhatsApp

➤ ÉTAPE 2 : Une fois connecté ✅
📜 tapez ➜ .menu

╔══════════════════════════╗
🎁 NB : Vous aurez droit à 5 appairages GRATUITS 🆓🚫
╚══════════════════════════╝

✨━━━━━━━━━━━━━━━━━━━━✨
🔥 Profitez bien ! 🔥
✨━━━━━━━━━━━━━━━━━━━━✨`;

  await sendImg(msg.chat.id, caption);
});

// ═══════════════════════════════════════════════════════════
//  /pair
// ═══════════════════════════════════════════════════════════
bot.onText(/^\/pair(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const user = getUser(chatId);
  const input = match[1] ? match[1].trim() : null;

  if (!input) {
    const caption =
`✨━━━━━━━━━━━━━━━━━━━━✨
🕷 WHATSAPP BAN PAIRING 🕷
✨━━━━━━━━━━━━━━━━━━━━✨

╔══════════════════════════╗
📡 Statut       ➜ 🟢 EN LIGNE
💰 Crédits      ➜ ${user.credits}
👤 Rôle         ➜ PAIRING BAN 📵
👑 Développeur  ➜ Mr Kira Tech ⚜️
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
🎯 COMMENT ÇA MARCHE
━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Envoie un numéro WhatsApp
📲 Format : 242XXXXXXXX

2️⃣ Le bot génère un code
🔑 8 chiffres de pairing

3️⃣ Entre le code dans WhatsApp
📱 Appareils connectés

4️⃣ ⚠️ Le numéro sera Off 💯

5️⃣ Coût du pairing : 1 crédit

━━━━━━━━━━━━━━━━━━━━━━
💳 OBTENIR DES CRÉDITS ?
━━━━━━━━━━━━━━━━━━━━━━
🌀 1 invite = 1 pair 🎁
🏷 Ou utilise un code promo

━━━━━━━━━━━━━━━━━━━━━━
🔥 Merci d'utiliser WhatsApp Ban Pairing ! 🔥
✨━━━━━━━━━━━━━━━━━━━━✨

👉 Tape : /pair 242XXXXXXXX`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '📩 Inviter des personnes', callback_data: 'invite' }],
        [{ text: '🏷 Code promos', callback_data: 'promos' }],
        [{ text: '📢 Chaîne Telegram', url: LINKS.tg_channel }],
        [{ text: '👥 Groupe Telegram', url: LINKS.tg_group }],
        [{ text: '📢 Chaîne WhatsApp', url: LINKS.wa_channel }],
        [{ text: '👥 Groupe WhatsApp', url: LINKS.wa_group }],
      ],
    };

    return sendImg(chatId, caption, { reply_markup: keyboard });
  }

  if (user.credits <= 0 && !user.isPaid) {
    return bot.sendMessage(chatId,
`⚠️❌ CRÉDITS ÉPUISÉS ❌⚠️
━━━━━━━━━━━━━━━━━━━━━━
🚫 Vous avez utilisé vos 5 appairages gratuits.
💳 Pour continuer : invitez ou code promo.

🎁 1 invitation = 1 crédit
🏷 Code promo disponible

✨━━━━━━━━━━━━━━━━━━━━✨`,
      { reply_markup: { inline_keyboard: [
        [{ text: '📩 Inviter des personnes', callback_data: 'invite' }],
        [{ text: '🏷 Code promos', callback_data: 'promos' }],
      ] } }
    );
  }

  const phone = sanitizePhone(input);
  if (phone.length < 8 || !/^\d+$/.test(phone)) {
    return bot.sendMessage(chatId,
`⚠️❌ ERREUR : NUMÉRO ERRONÉ ❌⚠️
━━━━━━━━━━━━━━━━━━━━━━
🚫 Le numéro que tu as tapé est invalide.
📲 Format correct : 242XXXXXXXX
⛔ Sans le (+) devant.
✅ Exemple : 242XXXXXXXX

🔁 Réessaie en tapant :
➜ /pair 242XXXXXXXX

✨━━━━━━━━━━━━━━━━━━━━✨
🙏 Merci de respecter le format demandé.
✨━━━━━━━━━━━━━━━━━━━━✨`);
  }

  const loading = await bot.sendMessage(chatId,
    `📡 Demande en cours pour <b>${phone}</b>…🔄`,
    { parse_mode: 'HTML' });

  try {
    const { code } = await generatePairingCode(phone, chatId, async (sock, phone2) => {
      user.credits = Math.max(0, user.credits - 1);
      user.totalPairings += 1;
      user.connectedNumbers.push(phone2);
      if (!DB.connectedNumbers.includes(phone2)) DB.connectedNumbers.push(phone2);
      saveDB();

      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const connectedMsg =
`✨━━━━━━━━━━━━━━━━━━━━✨
🎊🎉 CONGRATULATIONS ! 🎉🎊
✨━━━━━━━━━━━━━━━━━━━━✨

╔══════════════════════════╗
✅ BOT       ➜ Connecté 🤖
🟢 STATUS    ➜ OPEN
📅 DATE      ➜ ${nowDate()}
⚜️ BY        ➜ Mr Kira Tech ⚜️
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━
📌 NB :
➜ Tapez .menu chez la personne connectée 📲
━━━━━━━━━━━━━━━━━━━━━━

🔥✨ Profitez bien de votre bot ! ✨🔥
🎯 Merci d'utiliser BAN PAIRING BOT 🚫

✨━━━━━━━━━━━━━━━━━━━━✨`;

      await sendImg(chatId, connectedMsg);

      const selfJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      await sendWhatsAppWelcome(sock, selfJid);
    });

    if (code) {
      await bot.deleteMessage(chatId, loading.message_id).catch(() => {});

      const codeMsg =
`✨━━━━━━━━━━━━━━━━━━━━✨
📲 PAIRING CODE pour ${phone} ☑️
✨━━━━━━━━━━━━━━━━━━━━✨

╔══════════════════════════╗
🔑 CODE DE JUMELAGE :
╚══════════════════════════╝

\`\`\`
    ┌───────────────┐  
    │  ${code}  │  
    └───────────────┘  
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━
👉 INSTRUCTIONS :
━━━━━━━━━━━━━━━━━━━━━━
1️⃣ Ouvrez WhatsApp sur votre téléphone 📱
2️⃣ Allez dans « Appareils liés » 🔗 ➜ « Lier un appareil » ➕
3️⃣ Entrez ce code pour associer ce bot 🤖

━━━━━━━━━━━━━━━━━━━━━━
⚠️ NB : connecte-le avec un numéro à ban
✅ Une fois connecté, tapez .menu pour continuer 📜

✨━━━━━━━━━━━━━━━━━━━━✨
🙏 Merci d'utiliser BAN PAIRING BOT 🚫
🔥 Bon appairage ! 🔥
✨━━━━━━━━━━━━━━━━━━━━✨

> power by Mr Kira tech`;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📄 Copier', copy_text: { text: code } },
            { text: '⛔️ Check', callback_data: 'check_pairings' },
          ],
          [{ text: '📩 Inviter des personnes', callback_data: 'invite' }],
        ],
      };

      await sendImg(chatId, codeMsg, { reply_markup: keyboard });

      setTimeout(() => {
        const s = waSessions.get(chatId);
        if (s && s.phone === phone) {
          try { s.sock.ws.close(); } catch (e) {}
          waSessions.delete(chatId);
        }
      }, 5 * 60 * 1000);
    }
  } catch (err) {
    console.error('Pairing error:', err.message);
    await bot.deleteMessage(chatId, loading.message_id).catch(() => {});
    await bot.sendMessage(chatId,
`⚠️❌ ERREUR DE GÉNÉRATION ❌⚠️
━━━━━━━━━━━━━━━━━━━━━━
🚫 Impossible de générer le code d'appairage.
📲 Vérifie le numéro et réessaie.

🔁 /pair 242XXXXXXXX

✨━━━━━━━━━━━━━━━━━━━━✨`);
  }
});

// ═══════════════════════════════════════════════════════════
//  /link
// ═══════════════════════════════════════════════════════════
bot.onText(/^\/link$/, async (msg) => {
  const caption =
`✨━━━━━━━━━━━━━━━━━━━━✨
🔗 TOUS LES LIENS OFFICIELS 🔗
✨━━━━━━━━━━━━━━━━━━━━✨

📢 Chaîne Telegram
👥 Groupe Telegram
📢 Chaîne WhatsApp
👥 Groupe WhatsApp

👇 Clique sur les boutons ci-dessous`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '📢 Chaîne Telegram', url: LINKS.tg_channel }],
      [{ text: '👥 Groupe Telegram', url: LINKS.tg_group }],
      [{ text: '📢 Chaîne WhatsApp', url: LINKS.wa_channel }],
      [{ text: '👥 Groupe WhatsApp', url: LINKS.wa_group }],
    ],
  };

  await sendImg(msg.chat.id, caption, { reply_markup: keyboard });
});

// ═══════════════════════════════════════════════════════════
//  /contact
// ═══════════════════════════════════════════════════════════
bot.onText(/^\/contact(?:\s+us)?$/, async (msg) => {
  const caption =
`✨━━━━━━━━━━━━━━━━━━━━✨
📩 NOUS CONTACTER 📩
✨━━━━━━━━━━━━━━━━━━━━✨

Besoin d'aide ? Contacte un admin !

👇 Clique sur le bouton ci-dessous`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '📩 Contacter le support', url: LINKS.tg_group }],
    ],
  };

  await sendImg(msg.chat.id, caption, { reply_markup: keyboard });
});

// ═══════════════════════════════════════════════════════════
//  /promos


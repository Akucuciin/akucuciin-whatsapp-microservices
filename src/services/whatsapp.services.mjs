import {
  DisconnectReason,
  makeWASocket,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

let sock;

export const startWhatsAppBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth/whatsapp");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    shouldSyncHistoryMessage: false,
    version: [2, 2413, 1],
    getMessage: async () => undefined,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log("Disconnected. Reconnecting:", shouldReconnect);
      if (shouldReconnect) startWhatsAppBot();
    } else if (connection === "open") {
      console.log("✅✅✅✅✅✅✅✅ WhatsApp Connected!");
    }
  });
};

export const sendMessage = async (jid, text) => {
  if (!sock) throw new Error("WhatsApp bot is not connected yet!");
  await sock.sendMessage(jid, { text });
  console.log(`\nMessage sent to ${jid}: ${text}`);
};

export const sendMessageWithQr = async (jid, text) => {
  if (!sock) throw new Error("WhatsApp bot is not connected yet!");
  await sock.sendMessage(jid, text);
  console.log(`\nMessage with qr sent to ${jid}: ${text}`);
};

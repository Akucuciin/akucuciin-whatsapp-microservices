import "dotenv/config";
import express from "express";
import fs from "fs";
import Joi from "joi";
import mime from "mime";
import path from "path";
import { verifyXSignature } from "./middleware/x-signature.middleware.mjs";
import {
  sendMessage,
  sendMessageWithQr,
  startWhatsAppBot,
} from "./services/whatsapp.services.mjs";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.use("/static", express.static("static"));

await startWhatsAppBot();

// Schema
const whatsappMessageSchema = Joi.object({
  jid: Joi.string()
    .pattern(/^[0-9]+@s\.whatsapp\.net$/)
    .required()
    .messages({
      "string.pattern.base": "JID must be like '628xxxx@s.whatsapp.net'",
    }),
  content: Joi.string().optional().allow(""),
});

// Logging
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.ip} - ${req.method} ${req.originalUrl}`
  );
  next();
});

app.post("/send-with-qr", verifyXSignature, async (req, res) => {
  const { error, value } = whatsappMessageSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.details });
  }

  const { jid, content } = value;

  try {
    const filePath = path.join("static", "qris.jpeg");
    const buffer = fs.readFileSync(filePath);
    const mimetype = mime.getType(filePath);

    if (!mimetype || !mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "Invalid image file type" });
    }

    await sendMessageWithQr(jid, {
      image: { url: filePath },
      caption: content || "-",
    });

    res.status(200).json({ message: "Whatsapp Send", to: jid });
  } catch (err) {
    console.error("Error sending with image:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/send", verifyXSignature, async (req, res) => {
  const { error, value } = whatsappMessageSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ errors: error.details });
  }

  const { jid, content } = value;

  try {
    await sendMessage(jid, content);
    res.status(200).json({ message: "sent", to: jid });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: err.message });
  }
});

export default app;

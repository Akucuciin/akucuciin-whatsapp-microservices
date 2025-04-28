// middlewares/verifyHmac.ts
import crypto from "crypto";

const secret = process.env.HMAC_SECRET;
if (!secret) {
  throw new Error("HMAC_SECRET is not set in environment variables");
}

export function verifyXSignature(req, res, next) {
  try {
    const payloadStr = JSON.stringify(req.body);
    const xSignature = req.headers["x-signature"];

    if (!xSignature || typeof xSignature !== "string") {
      return res.status(403).json({ errors: "Forbidden – signature missing" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadStr)
      .digest("hex");

    console.log(expectedSignature);
    console.log(xSignature);

    if (xSignature !== expectedSignature) {
      return res.status(403).json({ errors: "Forbidden – invalid signature" });
    }

    /* const { timestamp } = req.body;
    const now = Date.now();
    if (!timestamp || Math.abs(now - timestamp) > 5 * 60 * 1000) {
      return res
        .status(408)
        .json({ errors: "Request expired or invalid timestamp" });
    } */

    next();
  } catch (error) {
    console.error("HMAC verification error:", error);
    res.status(500).json({ errors: "Internal Server Error" });
  }
}

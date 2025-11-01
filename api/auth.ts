import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || "";
  const path = url.split("?")[0];
  
  if (path === "/api/health") {
    return res.json({ status: "ok" });
  }
  
  if (path === "/api/auth/google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const callback = process.env.GOOGLE_CALLBACK_URL;
    
    if (!clientId || !callback) {
      return res.status(503).json({ error: "Not configured" });
    }
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callback)}&response_type=code&scope=openid%20email%20profile&access_type=online`;
    return res.redirect(302, authUrl);
  }
  
  if (path === "/api/auth/google/callback") {
    const code = req.query?.code;
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    
    if (!code) {
      return res.redirect(`${frontend}/auth?error=no_code`);
    }
    
    try {
      const jwt = require("jsonwebtoken");
      const token = jwt.sign({ temp: true }, process.env.JWT_SECRET || "secret", { expiresIn: "24h" });
      return res.redirect(`${frontend}/auth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({ email: "test@example.com" }))}`);
    } catch (error) {
      return res.redirect(`${frontend}/auth?error=failed`);
    }
  }
  
  return res.status(404).json({ error: "Not found" });
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set body limits to support large base64 image transfers from the UI for OCR
  app.use(express.json({ limit: "50mb" }));

  app.post("/api/debug_log", (req, res) => {
    console.log(`[FRONTEND DEBUG] ${req.body.message}`);
    res.sendStatus(200);
  });

  // API endpoint for server-side OCR processing
  app.post("/api/ocr", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 payload" });
      }

      // Strip of standard data:image/png;base64, header prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      console.log(`[API OCR] Triggering Gemini-3.5-Flash OCR text extraction for incoming image (${Math.round(cleanBase64.length / 1024)} KB)`);

      let response;
      let attempt = 0;
      let maxAttempts = 3;
      while (attempt < maxAttempts) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: cleanBase64
                  }
                },
                {
                  text: "Perform full OCR character extraction on this PDF page image. Transcribe all readable text layout from this page line-by-line. Protect technical tables, codes, headings, or manual indexes exactly. Output only the extracted transcription verbatim. Do not write any markdown headers, introduction, summary, conversational remarks, or system notes. Just output raw lines of extracted text as output."
                }
              ]
            }
          });
          break; // Success
        } catch (err: any) {
          const errMsg = err?.message || JSON.stringify(err);
          if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
            attempt++;
            if (attempt >= maxAttempts) {
              throw err;
            }
            // Parse retry delay from error message if available, otherwise default to 5s
            let delayMs = 5000;
            const retryMatch = errMsg.match(/retry in\s+(\d+(?:\.\d+)?)\s*s/);
            if (retryMatch && retryMatch[1]) {
              delayMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 1000; // Add 1s buffer
            }
            console.warn(`[API OCR] Rate limit hit. Retrying in ${delayMs / 1000}s... (Attempt ${attempt}/${maxAttempts - 1})`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          } else {
            throw err;
          }
        }
      }

      const extractedText = response?.text || "";
      console.log(`[API OCR] Successfully extracted ${extractedText.length} characters.`);
      res.json({ text: extractedText });
    } catch (err: any) {
      console.error("[API OCR Error]:", err);
      res.status(500).json({ error: err.message || "Failed to perform OCR on page image" });
    }
  });

  // Hot Module Replacement/Vite development or static asset serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
  });
}

startServer();

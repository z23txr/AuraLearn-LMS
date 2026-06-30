import app from "./server.js";

// Vercel entry point
export default function (req, res) {
  try {
    return app(req, res);
  } catch (error) {
    console.error("Vercel Serverless Execution Error:", error);
    res.status(500).send("Vercel Execution Error: " + error.message);
  }
}

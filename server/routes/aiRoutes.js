const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

console.log(
  "Gemini API Key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

router.post("/chat", async (req, res) => {
  try {
    const { message, menu = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const prompt = `
You are Raj Cafe AI, a friendly food assistant for Raj Cafe.

Restaurant:
Raj Cafe

Tagline:
Good Food. Great Mood.

IMPORTANT RULES:
1. Recommend ONLY food items present in the provided menu.
2. Never invent a food item.
3. Never invent a price.
4. Only recommend items where available data has been provided.
5. If the customer asks for food under a budget, respect the budget.
6. If the customer asks for vegetarian food, recommend only vegetarian items.
7. If the customer asks for best sellers, prefer featured items.
8. Keep answers short, friendly and useful.
9. You can understand Hindi, Hinglish and English.
10. If no suitable item exists, clearly tell the customer.

AVAILABLE RAJ CAFE MENU:
${JSON.stringify(menu, null, 2)}

CUSTOMER MESSAGE:
${message}

Give a helpful restaurant recommendation based ONLY on the menu above.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    return res.status(200).json({
      success: true,
      reply: response.text,
    });
  } catch (error) {
    console.error("AI Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI service is currently unavailable",
    });
  }
});

module.exports = router;
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
8. Keep the reply short and friendly.
9. You can understand Hindi, Hinglish and English.
10. If no suitable item exists, say so clearly.
11. Return ONLY valid JSON.
12. The "id" in recommendations MUST exactly match an id from the provided menu.
13. Recommend a maximum of 3 items.
14. If the customer asks to build a meal, create a complete meal combination using ONLY the available menu.
15. Respect the customer's stated budget.
16. Prefer combinations containing a main dish + side/snack + beverage when possible.
17. Return the selected meal items as recommendations so the website can show Add to Cart buttons.

AVAILABLE RAJ CAFE MENU:
${JSON.stringify(menu, null, 2)}

CUSTOMER MESSAGE:
${message}

Return exactly this JSON structure:

{
  "reply": "Short friendly answer to the customer",
  "recommendations": [
    {
      "id": "exact-menu-item-id",
      "reason": "short reason"
    }
  ]
}

If there are no suitable food items, return:

{
  "reply": "Sorry, I couldn't find a suitable item.",
  "recommendations": []
}
`;

    const response = await ai.models.generateContent({
  model: "gemini-3.6-flash",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
  },
});

    const rawText = response.text?.trim() || "";

    let aiResult;

    try {
      const cleanedText = rawText
  .replace(/^```json\s*/i, "")
  .replace(/^```\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

      aiResult = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("AI JSON Parse Error:", parseError);
      console.error("Raw AI Response:", rawText);

      return res.status(200).json({
        success: true,
        reply: rawText,
        recommendations: [],
      });
    }

    const validRecommendations = Array.isArray(aiResult.recommendations)
      ? aiResult.recommendations
          .filter((recommendation) =>
            menu.some((item) => item.id === recommendation.id)
          )
          .slice(0, 3)
          .map((recommendation) => {
            const item = menu.find(
              (menuItem) => menuItem.id === recommendation.id
            );

            return {
              ...item,
              reason: recommendation.reason || "Recommended for you",
            };
          })
      : [];

    return res.status(200).json({
      success: true,
      reply:
        aiResult.reply ||
        "Here are some recommendations from Raj Cafe.",
      recommendations: validRecommendations,
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

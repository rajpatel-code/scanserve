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
const getBudgetFromText = (text) => {
  const match = text.match(/(?:₹|rs\.?|rupees?)\s*(\d+)/i);
  return match ? Number(match[1]) : null;
};

const getPeopleFromText = (text) => {
  const match = text.match(
    /(\d+)\s*(?:people|person|persons|log|logo|members|pax)/i
  );

  return match ? Number(match[1]) : null;
};
router.post("/chat", async (req, res) => {
  try {
    const { message, menu = [] } = req.body;
    const budget = getBudgetFromText(message);
const people = getPeopleFromText(message);

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
13. Recommend a maximum of 3 different menu items.
14. If the customer asks to build a meal, create a complete meal combination using ONLY the available menu.
15. Respect the customer's stated budget.
16. If the customer mentions a number of people, you MUST use that number when planning the meal quantities.
17. Each recommendation MUST include a positive integer quantity.
18. If the customer says "for 2 people", the meal must provide suitable portions for 2 people. Do NOT automatically use quantity 1 for every item.
19. For multiple people, increase the quantity of suitable shareable or individual items as needed. For example, for 2 people, quantity may be 2 for naan, beverages, snacks, or other individual items when appropriate.
20. If the stated budget is not enough to give quantity equal to the number of people for every item, choose a practical shared meal combination that serves the requested number of people while staying within the budget.
21. NEVER ignore the customer's number of people.
22. The quantity must be included in the recommendation JSON and must be a positive integer.
23. Never invent quantity, price, name, image or id. Use only information available in the provided menu.
24. The recommendation id MUST exactly match an id from the provided menu.
25. When planning a meal, use the detected customer budget if available.
26. When planning a meal, use the detected number of people if available.
27. Detected customer budget:
₹${budget ?? "Not specified"}
28. Detected number of people:
${people ?? "Not specified"}
29. If a number of people is specified, quantities must be planned for that many people.
30. For a meal request, prioritize a practical combination of main course + side/snack + beverage when those categories exist in the menu.
31. Do not simply return the first three cheapest items.
32. Choose quantities based on whether an item is an individual serving or a shareable item.
33. The estimated meal subtotal must not exceed the detected budget when a budget is specified, unless no feasible combination exists.
34. If no feasible combination exists within the budget, clearly explain that in the reply and return the closest practical combination from the available menu.
35. Never create more than 3 different menu item IDs.
36. The final recommendations must contain the actual menu item IDs and quantities.

AVAILABLE RAJ CAFE MENU:
${JSON.stringify(menu, null, 2)}
DETECTED MEAL REQUIREMENTS:

Budget: ₹${budget ?? "Not specified"}
People: ${people ?? "Not specified"}

CUSTOMER MESSAGE:
${message}

Return exactly this JSON structure:

{
  "reply": "Short friendly answer to the customer",
  "recommendations": [
    {
  "id": "exact-menu-item-id",
  "quantity": 1,
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
  model: "gemini-3.5-flash",
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

    let validRecommendations = Array.isArray(aiResult.recommendations)
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
          quantity: Math.max(
            1,
            Math.floor(Number(recommendation.quantity) || 1)
          ),
          reason:
            recommendation.reason || "Recommended for you",
        };
      })
  : [];

// -----------------------------------------
// BACKEND BUDGET VALIDATION
// -----------------------------------------

if (budget !== null && validRecommendations.length > 0) {
  let runningTotal = 0;

  validRecommendations = validRecommendations
    .map((item) => {
      const price = Number(item.price) || 0;
      let quantity = item.quantity;

      while (
        quantity > 0 &&
        runningTotal + price * quantity > budget
      ) {
        quantity--;
      }

      if (quantity > 0) {
        runningTotal += price * quantity;

        return {
          ...item,
          quantity,
        };
      }

      return null;
    })
    .filter(Boolean);
}

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

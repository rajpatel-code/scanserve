const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const getLocalResponse = (message, menu = []) => {
  const text = String(message || "").toLowerCase().trim();

  if (!text || !Array.isArray(menu) || menu.length === 0) {
    return null;
  }

  const getPrice = (item) => Number(item.price) || 0;

  const isVegetarian = (item) =>
    item.veg === true ||
    item.isVeg === true ||
    String(item.veg).toLowerCase() === "true" ||
    String(item.isVeg).toLowerCase() === "true";

  const isFeatured = (item) =>
    item.featured === true ||
    String(item.featured).toLowerCase() === "true";

  const getQuantity = () => {
    const match = text.match(/\b(\d+)\b/);
    return match ? Math.max(1, Number(match[1])) : 1;
  };

  const quantity = getQuantity();

  // 🥗 VEGETARIAN FOOD
  if (
    text.includes("vegetarian") ||
    text.includes("veg food") ||
    text.includes("veg") ||
    text.includes("vegetarian food")
  ) {
    const items = menu
      .filter(isVegetarian)
      .slice(0, 3);

    return {
      reply:
        items.length > 0
          ? "Here are some delicious vegetarian options from Raj Cafe! 🥗"
          : "Sorry, I couldn't find vegetarian items in the menu.",
      recommendations: items.map((item) => ({
        ...item,
        quantity: 1,
        reason: "Vegetarian choice",
      })),
    };
  }

  // ⭐ BEST SELLERS
  if (
    text.includes("best seller") ||
    text.includes("best sellers") ||
    text.includes("bestseller") ||
    text.includes("popular")
  ) {
    const items = menu
      .filter(isFeatured)
      .slice(0, 3);

    if (items.length > 0) {
      return {
        reply: "Here are Raj Cafe's best sellers! ⭐",
        recommendations: items.map((item) => ({
          ...item,
          quantity: 1,
          reason: "Popular Raj Cafe favorite",
        })),
      };
    }
  }

  // 💰 UNDER BUDGET
  const budgetMatch = text.match(
    /(?:under|below|within|upto|up to|₹|rs\.?|rupees)\s*(?:₹|rs\.?)?\s*(\d+)/i
  );

  if (budgetMatch) {
    const budget = Number(budgetMatch[1]);

    if (budget > 0) {
      const items = menu
        .filter((item) => getPrice(item) <= budget)
        .sort((a, b) => {
          if (isFeatured(b) !== isFeatured(a)) {
            return isFeatured(b) ? 1 : -1;
          }

          return getPrice(b) - getPrice(a);
        })
        .slice(0, 3);

      return {
        reply:
          items.length > 0
            ? `Here are some great options under ₹${budget}! 💰`
            : `Sorry, I couldn't find anything under ₹${budget}.`,
        recommendations: items.map((item) => ({
          ...item,
          quantity: 1,
          reason: `Fits your ₹${budget} budget`,
        })),
      };
    }
  }

  // 🥤 COLD DRINK / SOFT DRINK
  if (
    text.includes("cold drink") ||
    text.includes("cold drinks") ||
    text.includes("soft drink") ||
    text.includes("coke") ||
    text.includes("cola")
  ) {
    const items = menu
      .filter((item) => {
        const name = String(
          item.name || item.foodName || ""
        ).toLowerCase();

        const category = String(
          item.category || ""
        ).toLowerCase();

        return (
          name.includes("cold drink") ||
          name.includes("coke") ||
          name.includes("cola") ||
          category.includes("beverage")
        );
      })
      .slice(0, 3);

    if (items.length > 0) {
      return {
        reply: `Sure! Maine ${quantity} chilled cold drink${
          quantity > 1 ? "s" : ""
        } add karne ke liye select kar di${
          quantity > 1 ? " hain" : " hai"
        }. 🥤`,
        recommendations: items.map((item) => ({
          ...item,
          quantity,
          reason: "Refreshing drink for your order",
        })),
      };
    }
  }

  // 🍔 SIMPLE FOOD SEARCH
  const foodKeywords = [
    "burger",
    "pizza",
    "naan",
    "pasta",
    "sandwich",
    "biryani",
    "tikka",
    "paneer",
    "fries",
    "samosa",
    "dal",
    "rice",
    "coffee",
    "tea",
    "juice",
    "shake",
    "dessert",
    "cake",
    "ice cream",
  ];

  const matchedKeyword = foodKeywords.find((keyword) =>
    text.includes(keyword)
  );

  if (matchedKeyword) {
    const items = menu
      .filter((item) => {
        const name = String(
          item.name || item.foodName || ""
        ).toLowerCase();

        const category = String(
          item.category || ""
        ).toLowerCase();

        return (
          name.includes(matchedKeyword) ||
          category.includes(matchedKeyword)
        );
      })
      .slice(0, 3);

    if (items.length > 0) {
      return {
        reply: `Sure! Ye ${matchedKeyword} options menu mein available hain. 🍽️`,
        recommendations: items.map((item) => ({
          ...item,
          quantity,
          reason: `Matches your ${matchedKeyword} request`,
        })),
      };
    }
  }

  // ❌ Not a simple command → Gemini will handle it
  return null;
};
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
    /(\d+)\s*(?:people|person|persons|log|members|pax)/i
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
13. Recommend a maximum of 3 different menu items. For specific item requests, the maximum of 3 items rule does not mean you should add extra items. Return only the specifically requested items.
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
37. SPECIFIC ITEM REQUEST HAS HIGHEST PRIORITY.

38. If the customer explicitly names a specific food or drink item, recommend ONLY that exact matching menu item unless the customer explicitly asks for additional items.

39. If the customer says "2 cold drink", "2 cold drinks", "2 cold drink add karo", or similar, return ONLY the exact menu item matching "Cold Drink" with quantity 2.

40. NEVER substitute, add, or recommend similar items when the customer explicitly names a specific item.

41. For a specific item request, do NOT recommend other items from the same category.

42. If the customer asks for multiple specific items, return ONLY those specifically requested items with their requested quantities.

43. Extract the requested quantity from the customer's message and apply it ONLY to the matching requested item.

44. If the requested item does not exist in the provided menu, clearly say that the item is not available. Do NOT substitute another item.

45. General recommendation requests such as "suggest something", "best food", "show vegetarian food", or "what should I eat" may return up to 3 suitable items.

46. A request containing a specific menu item name must NEVER be treated as a general recommendation request.

47. Example:
Customer: "2 cold drink add karo"
Correct: Cold Drink × 2
Incorrect: Cold Drink × 2 + Sweet Curd Lassi × 2 + Watermelon Juice × 2

48. The quantity of a recommendation must represent the customer's requested quantity when a specific item is requested. Do not apply that quantity to unrelated items.

49. If the customer asks to "add", "order", or "give" a specific item, treat it as a direct item-selection request, not a general recommendation request.

50. When a specific item is requested, return the exact matching menu item ID from the provided menu and its requested quantity.

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
// SPECIFIC ITEM REQUEST GUARD
// -----------------------------------------

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const normalizedMessage = normalizeText(message);

const quantityMatch = normalizedMessage.match(/\b(\d+)\b/);
const requestedQuantity = quantityMatch
  ? Math.max(1, Number(quantityMatch[1]))
  : 1;

const exactRequestedItem = [...menu]
  .filter((item) => item?.id && item?.name)
  .sort(
    (a, b) =>
      normalizeText(b.name).length -
      normalizeText(a.name).length
  )
  .find((item) => {
    const itemName = normalizeText(item.name);
    const itemNamePlural = itemName.endsWith("s")
  ? itemName
  : `${itemName}s`;

   const namesToMatch = [itemName, itemNamePlural];

return namesToMatch.some((name) =>
  normalizedMessage === name ||
  normalizedMessage.includes(` ${name} `) ||
  normalizedMessage.startsWith(`${name} `) ||
  normalizedMessage.endsWith(` ${name}`)
);
  });

if (exactRequestedItem) {
  validRecommendations = [
    {
      ...exactRequestedItem,
      quantity: requestedQuantity,
      reason: "Requested item",
    },
  ];
}
// -----------------------------------------
// BACKEND BUDGET VALIDATION
// -----------------------------------------

if (
  !exactRequestedItem &&
  budget !== null &&
  validRecommendations.length > 0
) {
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

  const isQuotaError =
    error?.status === 429 ||
    error?.code === 429 ||
    String(error?.message || "").includes("429") ||
    String(error?.message || "").toLowerCase().includes("quota");

  return res.status(500).json({
    success: false,
    message: "AI service is currently unavailable",
  });
}
});

module.exports = router;

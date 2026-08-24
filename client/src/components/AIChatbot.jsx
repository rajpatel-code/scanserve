import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import {
  Bot,
  MessageCircle,
  Send,
  X,
  Sparkles,
  ShoppingCart,
  Mic,
} from "lucide-react";
import useCart from "../hooks/useCart";

const AIChatbot = () => {
  const { addToCart } = useCart();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [menu, setMenu] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hi! 👋 I'm Raj Cafe AI. How can I help you today?",
      recommendations: [],
    },
  ]);

  // Load live menu from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "menu"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const availableMenu = data.filter(
          (item) => item.available === true
        );

        setMenu(availableMenu);
      },
      (error) => {
        console.error("AI Menu Error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

const getBudgetFromText = (text) => {
  const match = text.match(/₹\s?(\d+)/);
  return match ? Number(match[1]) : null;
};

const addItemToCartWithQuantity = (item) => {
  if (!item) return;

  const quantity = Math.max(1, Number(item.quantity) || 1);

  addToCart(item, quantity);
};

const addAllToCart = (items) => {
  if (!items || items.length === 0) return;

  items.forEach((item) => {
    addItemToCartWithQuantity(item);
  });
};

const startVoiceOrdering = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice ordering is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsListening(true);
  };

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;

    setInput(spokenText);
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error:", event.error);
    setIsListening(false);
  };

  recognition.onend = () => {
    setIsListening(false);
  };

  recognition.start();
};

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

  setLoading(true);

    const userMessage = {
      id: Date.now(),
      type: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        "https://scanserve-backend.onrender.com/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,

            menu: menu.map((item) => ({
              id: item.id,
              name: item.name || item.foodName,
              category: item.category,
              price: Number(item.price),
              description: item.description,

              // Important for recommendation cards
              image:
                item.image ||
                item.imageUrl ||
                item.imageURL ||
                item.foodImage ||
                "",

              featured: item.featured === true,
              type: item.type,
              veg: item.veg,
              isVeg: item.isVeg,
              available: item.available === true,
            })),
          }),
        }
      );
if (!response.ok) {
  throw new Error(`AI API error: ${response.status}`);
}
      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: "bot",
            text: data.reply,
            recommendations: data.recommendations || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: "bot",
            text: "Sorry 😔 I couldn't process your request.",
            recommendations: [],
          },
        ]);
      }
    } catch (error) {
      console.error("Chatbot Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          text: "Sorry 😔 AI service is currently unavailable.",
          recommendations: [],
        },
      ]);
    }
    finally {
  setLoading(false);
}
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[100] flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-2xl transition hover:scale-110 hover:bg-orange-600"
          aria-label="Open Raj Cafe AI"
        >
          <Bot size={30} />

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold">
            AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[100] flex h-[600px] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
                <Sparkles size={23} />
              </div>

              <div>
                <h3 className="font-bold">Raj Cafe AI</h3>

                <p className="text-xs text-orange-100">
                  Your food assistant
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/20"
              aria-label="Close chatbot"
            >
              <X size={22} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div className="max-w-[88%]">
                  
                  {/* Text */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      message.type === "user"
                        ? "rounded-br-md bg-orange-500 text-white"
                        : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                    }`}
                  >
                    {message.text}
                  </div>

                  {/* AI Recommendation Cards */}
                  {message.type === "bot" &&
  message.recommendations?.length > 0 && (() => {
    const recommendedItems = message.recommendations;

    const mealTotal = recommendedItems.reduce(
  (sum, item) =>
    sum +
    Number(item.price || 0) * Math.max(1, Number(item.quantity) || 1),
  0
);

    const budget = getBudgetFromText(
      messages
        .slice(0, messages.indexOf(message) + 1)
        .filter((m) => m.type === "user")
        .pop()?.text || ""
    );

    const remaining = budget !== null
      ? budget - mealTotal
      : null;

    return (
      <div className="mt-3 space-y-3">
                      
                        {message.recommendations.map((item) => (
                          <div
                            key={item.id}
                            className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm"
                          >
                            {/* Food Image */}
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-32 w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-24 items-center justify-center bg-orange-50 text-4xl">
                                🍽️
                              </div>
                            )}

                            <div className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {item.name}
                                  </h4>

                                  {item.category && (
                                    <p className="mt-1 text-xs text-gray-500">
                                      {item.category}
                                    </p>
                                  )}
                                </div>

                                <div className="text-right">
  <span className="whitespace-nowrap font-bold text-orange-600">
    ₹{Number(item.price || 0)}
  </span>

  {Number(item.quantity) > 1 && (
    <p className="mt-1 text-xs font-medium text-gray-500">
      × {item.quantity}
    </p>
  )}
</div>
                              </div>

                              {item.reason && (
                                <p className="mt-2 text-xs text-gray-600">
                                  ⭐ {item.reason}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() => addItemToCartWithQuantity(item)}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.98]"
                              >
                                <ShoppingCart size={17} />
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        ))}
                        {loading && (
  <div className="flex justify-start">
    <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
      Raj Cafe AI is thinking... 🤔
    </div>
  </div>
)}

                        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-500">AI Selected Meal</p>
      <p className="text-lg font-bold text-gray-900">
        ₹{mealTotal}
      </p>
    </div>

    {remaining !== null && (
      <div className="text-right">
        <p className="text-xs text-gray-500">Budget Remaining</p>
        <p
          className={`font-bold ${
            remaining >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {remaining >= 0
            ? `₹${remaining} left`
            : `₹${Math.abs(remaining)} over`}
        </p>
      </div>
    )}
  </div>

                <button
                 type="button"
                   onClick={() => addAllToCart(recommendedItems)}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white"
                             >
                      <ShoppingCart size={18} />
                     Add All to Cart
                    </button>
                      </div>
                      </div>
                       );
})()}
                       </div>
                        </div>
                          ))}
                        </div>

          {/* Quick Questions */}
          <div className="border-t bg-white px-4 py-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              
              <button
                type="button"
                onClick={() => setInput("What are your best sellers?")}
                className="whitespace-nowrap rounded-full bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100"
              >
                ⭐ Best Sellers
              </button>

              <button
                type="button"
                onClick={() =>
                  setInput("Suggest something under ₹300")
                }
                className="whitespace-nowrap rounded-full bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100"
              >
                💰 Under ₹300
              </button>

              <button
                type="button"
                onClick={() => setInput("Show vegetarian food")}
                className="whitespace-nowrap rounded-full bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100"
              >
                🥗 Veg Food
              </button>
              <button
  type="button"
  onClick={() =>
    setInput("Build a complete meal for me under ₹400")
  }
  className="whitespace-nowrap rounded-full bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100"
>
  🍽️ Build My Meal
</button>
<button
  type="button"
  onClick={() =>
    setInput(
      "🎯 Find my taste. Ask me what kind of food I like and then recommend the best matching items from the menu."
    )
  }
  className="whitespace-nowrap rounded-full bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100"
>
  🎯 Find My Taste
</button>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 focus-within:border-orange-400">
              <MessageCircle
                size={20}
                className="ml-2 text-gray-400"
              />

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Raj Cafe AI..."
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none"
              />
              <button
  type="button"
  onClick={startVoiceOrdering}
  disabled={loading}
  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
    isListening
      ? "bg-red-500 text-white animate-pulse"
      : "bg-orange-100 text-orange-600 hover:bg-orange-200"
  }`}
  aria-label={isListening ? "Listening" : "Start voice ordering"}
>
  <Mic size={20} />
</button>

              <button
  type="button"
  onClick={sendMessage}
  disabled={loading}
  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-600 ${
    loading ? "cursor-not-allowed opacity-60" : ""
  }`}
  aria-label="Send message"
>
  <Send size={18} />
</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
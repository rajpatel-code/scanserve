import React from "react";
import { Link } from "react-router-dom";

function Offers() {
  const offers = [
    {
      title: "20% OFF",
      description: "Get 20% off on your first order.",
      code: "WELCOME20",
    },
    {
      title: "FREE DELIVERY",
      description: "Free delivery on orders above ₹499.",
      code: "FREE499",
    },
    {
      title: "COMBO DEAL",
      description: "Burger + Fries + Coke at just ₹299.",
      code: "COMBO299",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-8 inline-block rounded-lg border px-5 py-2"
        >
          ← Back Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900">
          Today's Offers 🎉
        </h1>

        <p className="mt-3 text-gray-600">
          Enjoy amazing deals at Raj Cafe.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="rounded-2xl bg-white p-6 shadow-md"
            >
              <h2 className="text-3xl font-bold text-orange-500">
                {offer.title}
              </h2>

              <p className="mt-4 text-gray-600">
                {offer.description}
              </p>

              <div className="mt-5 rounded-lg bg-orange-50 p-3 text-center font-semibold">
                Code: {offer.code}
              </div>

              <Link
                to="/menu"
                className="mt-5 block rounded-lg bg-orange-500 px-5 py-3 text-center font-semibold text-white"
              >
                Order Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Offers;
import React from "react";
import { Link } from "react-router-dom";

function Reviews() {
  const reviews = [
    {
      name: "Raj Patel",
      rating: "★★★★★",
      text: "Amazing food and very quick service!",
    },
    {
      name: "Sumit Agnihotri",
      rating: "★★★★★",
      text: "The burger and coffee were excellent.",
    },
    {
      name: "Priya Singh",
      rating: "★★★★☆",
      text: "Great experience. Food was fresh and tasty.",
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
          Customer Reviews ⭐
        </h1>

        <p className="mt-3 text-gray-600">
          See what our customers say about Raj Cafe.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-2xl bg-white p-6 shadow-md"
            >
              <div className="text-xl text-orange-500">
                {review.rating}
              </div>

              <p className="mt-4 text-gray-600">
                "{review.text}"
              </p>

              <h3 className="mt-5 font-bold text-gray-900">
                {review.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reviews;
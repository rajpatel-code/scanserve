import React from "react";
import { Link } from "react-router-dom";

function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/"
          className="mb-8 inline-block rounded-lg border px-5 py-2"
        >
          ← Back Home
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-4xl font-bold text-gray-900">
            Contact Raj Cafe ☕
          </h1>

          <p className="mt-3 text-gray-600">
            Have a question? We would love to hear from you.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-bold">📞 Phone</h3>
              <p className="mt-2 text-gray-600">+91 98765 43210</p>
            </div>

            <div>
              <h3 className="font-bold">📧 Email</h3>
              <p className="mt-2 text-gray-600">
                support@rajcafe.com
              </p>
            </div>

            <div>
              <h3 className="font-bold">📍 Address</h3>
              <p className="mt-2 text-gray-600">
                Raj Cafe, India
              </p>
            </div>
          </div>

          <Link
            to="/menu"
            className="mt-10 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white"
          >
            Order Food
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Contact;
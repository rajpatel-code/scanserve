import coffee from "../../assets/coffee.png";
import { restaurant } from "../../data/restaurant";
import { useNavigate } from "react-router-dom";

function Hero() {
   const navigate = useNavigate();
  return (
    <section className="bg-[#FAFAFA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}

          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-5 py-2 rounded-full text-sm font-semibold">
              ⭐ {restaurant.rating} Rating • {restaurant.reviews}+ Reviews
            </div>

            <h1 className="mt-8 text-7xl font-black leading-[1.05] tracking-tight text-gray-900">
              Good Food.
              <br />
              Great Mood.
            </h1>

            <p className="mt-8 text-xl leading-9 text-gray-500 max-w-xl">
              Order delicious food directly from your table.
              <br />
              No waiting.
              <br />
              No confusion.
            </p>

            <div className="mt-12 flex gap-5">
              <button
  onClick={() => navigate("/menu")}
  className="bg-orange-500 hover:bg-orange-600 transition duration-300 hover:-translate-y-1 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-orange-300/40"
>
  Explore Menu
</button>

              <button
  onClick={() => navigate("/offers")}
  className="border border-gray-300 bg-white hover:bg-gray-100 transition duration-300 px-8 py-4 rounded-2xl font-semibold"
>
  Today's Offer
</button>
            </div>
          </div>

          {/* RIGHT CONTENT */}

          <div className="relative flex justify-center items-center h-[620px]">
            {/* Background Glow */}

            <div className="absolute w-[560px] h-[560px] rounded-full bg-gradient-to-br from-orange-100 via-orange-50 to-white shadow-[0_0_120px_rgba(251,146,60,0.25)]"></div>

            {/* Coffee Image */}

            <img
              src={coffee}
              alt="Coffee"
              className="absolute w-[540px] object-contain drop-shadow-[0_40px_55px_rgba(0,0,0,0.28)] hover:scale-105 transition-all duration-500 z-10"
            />

            {/* Premium Coffee */}

            <div className="absolute top-10 right-0 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-full shadow-2xl border border-gray-100 z-20">
              ☕ Premium Coffee
            </div>

            {/* Best Seller */}

            <div className="absolute bottom-24 left-0 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-full shadow-2xl border border-gray-100 z-20">
              🍕 Best Seller
            </div>

            {/* Rating */}

            <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-xl px-5 py-3 rounded-full shadow-2xl border border-gray-100 z-20">
              ⭐ {restaurant.rating} Rating
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
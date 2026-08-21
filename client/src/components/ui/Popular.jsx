import { restaurant } from "../../data/restaurant";

function Popular() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}

        <div className="flex items-end justify-between mb-14">
          <div>
            <span className="text-orange-500 font-semibold uppercase tracking-widest">
              Popular Dishes
            </span>

            <h2 className="text-5xl font-black text-gray-900 mt-3">
              Customer Favorites
            </h2>

            <p className="mt-4 text-lg text-gray-500">
              Most loved dishes ordered by our customers.
            </p>
          </div>

          <button className="font-semibold text-orange-500 hover:text-orange-600 transition">
            See All →
          </button>
        </div>

        {/* Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {restaurant.popularDishes.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-[32px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3"
            >
              {/* Image */}

              <div className="relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover group-hover:scale-110 duration-500"
                />

                {item.bestSeller && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-full">
                    🔥 Best Seller
                  </div>
                )}

                <button className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white shadow-lg hover:scale-110 transition">
                  ❤️
                </button>
              </div>

              {/* Content */}

              <div className="p-6">

                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl text-gray-900">
                    {item.name}
                  </h3>

                  <span className="text-yellow-500 font-semibold">
                    ⭐ {item.rating}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-6">

                  <h4 className="text-3xl font-black text-orange-500">
                    ₹{item.price}
                  </h4>

                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl font-semibold transition">
                    Add +
                  </button>

                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Popular;
import { restaurant } from "../../data/restaurant";
import FoodCard from "./FoodCard";

function FoodGrid({ search, category }) {
  const filteredMenu = restaurant.menu.filter((item) => {
    const searchMatch =
      item.name.toLowerCase().includes(search.toLowerCase());

    const categoryMatch =
      category === "All" || item.category === category;

    return searchMatch && categoryMatch;
  });

  return (
    <section className="mt-12">

      {filteredMenu.length === 0 ? (
        <div className="text-center py-20">

          <h2 className="text-3xl font-bold">
            No Food Found 🍽️
          </h2>

          <p className="text-gray-500 mt-3">
            Try another search.
          </p>

        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {filteredMenu.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
            />
          ))}

        </div>
      )}

    </section>
  );
}

export default FoodGrid;
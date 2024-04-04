import { useState } from "react";
import ProductCard from "../components/ProductCard";
import {
  useCategoriesQuery,
  useSearchProductsQuery,
} from "../redux/api/productApi";
import toast from "react-hot-toast";
import { CustomError } from "../types/apiTypes";
import { SkeletonLoader } from "../components/Loader";

const Search = () => {
  const {
    data: categoriesResponse,
    isLoading: loadingCategories,
    isError,
    error,
  } = useCategoriesQuery("");
  if (isError) toast.error((error as CustomError).data.message);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(10000000000);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { isLoading, data, isError:ProductIsError,error:ProductError } = useSearchProductsQuery({
    search,
    sort,
    category,
    page,
    price: maxPrice,
  });
  const addToHandler = () => {};
  const isNextPage = page < 4;
  const isPrevPage = page > 1;
  if (ProductIsError) toast.error((ProductError as CustomError).data.message);

  return (
    <div className="product-search-page">
      <aside>
        <h2>Filters</h2>
        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">None</option>
            <option value="asc">Price (Low to High)</option>
            <option value="dsc">Price (High to Low)</option>
          </select>
        </div>
        <div>
          <h4>Max Price:{maxPrice || ""}</h4>
          <input
            type="range"
            min={10}
            max={200000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <h4>Category</h4>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {!loadingCategories &&
              categoriesResponse?.categories.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
          </select>
        </div>
      </aside>

      <main>
        <h1>Products</h1>
        <input
          type="text"
          placeholder="Search by Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="search-product-list">
            {data?.products.map((i) => (
              <ProductCard
                key={i._id}
                productId={i._id}
                name={i.name}
                price={i.price}
                stock={i.stock}
                handler={addToHandler}
                photo={i.photo}
              />
            ))}
          </div>
        )}

        {data && data.totalPages > 1 && (
          <article>
            <button
              disabled={!isPrevPage}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </button>
            <span>
              {page} of {data.totalPages}
            </span>
            <button
              disabled={!isNextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>
          </article>
        )}
      </main>
    </div>
  );
};

export default Search;

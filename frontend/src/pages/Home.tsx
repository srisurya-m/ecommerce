import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useLatestProductsQuery } from "../redux/api/productApi";
import toast from "react-hot-toast";
import { SkeletonLoader } from "../components/Loader";
import { CartItem } from "../types/types";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/reducer/cartReducer";

const Home = () => {
  const { data, isLoading, isError } = useLatestProductsQuery("");
  if (isError) toast.error("Something Went Wrong!");
  const dispatch = useDispatch();
  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");
    dispatch(addToCart(cartItem));
    toast.success("Product added to cart successfully");
  };
  return (
    <div className="home">
      <section></section>

      <h1>
        Latest Products
        <Link to="/search" className="findmore">
          More
        </Link>
      </h1>
      <main>
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          data?.products.map((i) => (
            <ProductCard
              key={i._id}
              productId={i._id}
              name={i.name}
              price={i.price}
              stock={i.stock}
              handler={addToCartHandler}
              photos={i.photos}
            />
          ))
        )}
      </main>
    </div>
  );
};

export default Home;

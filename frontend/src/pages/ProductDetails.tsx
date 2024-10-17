import { Navigate, useParams } from "react-router-dom";
import { useProductDetailsQuery } from "../redux/api/productApi";
import { SkeletonLoader } from "../components/Loader";
import {
  CarouselButtonType,
  MyntraCarousel,
  Slider,
  StylishCarousel,
} from "6pp";
import { useState } from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import RatingsComponent from "../components/Ratings";
import { CartItem } from "../types/types";
import toast from "react-hot-toast";
import { addToCart } from "../redux/reducer/cartReducer";
import { useDispatch } from "react-redux";

type CartButtonsProps = {
  addToCartHandler: (cartItem: CartItem) => string | undefined;
};

const ProductDetails = () => {
  const params = useParams();
  const dispatch = useDispatch();

  const { isLoading, isError, data } = useProductDetailsQuery(
    params.id!
  );

  const [carouselOpen, setCarouselOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const increment = () => {
    if (data?.product.stock === quantity)
      return toast.error("Exceeds Available Stocks");

    setQuantity((prev) => prev + 1);
  };
  const decrement = () => setQuantity((prev) => prev - 1);

  const addToCartHandler = (cartItem: CartItem) => {
    if (cartItem.stock < 1) return toast.error("Out of Stock");
    dispatch(addToCart(cartItem));
    toast.success("Product added to cart successfully");
  };

  if(isError) return <Navigate to="/404" />

  return (
    <div className="product-details">
      {isLoading ? (
        <ProductLoader />
      ) : (
        <>
          <main>
            <section>
              <Slider
                showNav={false}
                showThumbnails
                onClick={() => setCarouselOpen(true)}
                images={data?.product.photos.map((i) => i.url) || []}
              />
              {carouselOpen && (
                <MyntraCarousel
                  darkMode
                  NextButton={NextButton}
                  PrevButton={PrevButton}
                  setIsOpen={setCarouselOpen}
                  images={data?.product.photos.map((i) => i.url) || []}
                />
              )}
            </section>
            <section>
              <h1>{data?.product?.name}</h1>
              <code>{data?.product?.category}</code>
              <RatingsComponent value={data?.product?.ratings || 0} />
              <h3>₹{data?.product?.price}</h3>
              <article>
                <div>
                  <button onClick={decrement}>-</button>
                  <span>{quantity}</span>
                  <button onClick={increment}>+</button>
                </div>
                <button
                  onClick={() =>
                    addToCartHandler({
                      productId: data?.product?._id!,
                      name: data?.product?.name!,
                      price: data?.product?.price!,
                      stock: data?.product?.stock!,
                      quantity,
                      photo: data?.product?.photos[0].url || "",
                    })
                  }
                >
                  Add To Cart
                </button>
              </article>
              <p>{data?.product?.description}</p>
            </section>
          </main>
        </>
      )}
    </div>
  );
};

const ProductLoader = () => {
  return (
    <div
      style={{
        display: "flex",
        gap: "2rem",
        border: "1px solid #f1f1f1",
        height: "80vh",
      }}
    >
      <section style={{ width: "100%", height: "100%" }}>
        <SkeletonLoader
          width="100%"
          height="100%"
          length={1}
          containerHeight="100%"
        />
      </section>
      <section
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "4rem",
          padding: "2rem",
        }}
      >
        <SkeletonLoader width="100%" length={3} />
        <SkeletonLoader width="100%" length={4} />
        <SkeletonLoader width="100%" length={4} />
      </section>
    </div>
  );
};

const NextButton: CarouselButtonType = ({ onClick }) => (
  <button onClick={onClick} className="carousel-btn">
    <FaArrowRightLong />
  </button>
);
const PrevButton: CarouselButtonType = ({ onClick }) => (
  <button onClick={onClick} className="carousel-btn">
    <FaArrowLeftLong />
  </button>
);

export default ProductDetails;

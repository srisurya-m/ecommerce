import { CarouselButtonType, MyntraCarousel, Slider, useRating } from "6pp";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaRegStar, FaStar, FaTrash } from "react-icons/fa";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { SkeletonLoader } from "../components/Loader";
import RatingsComponent from "../components/Ratings";
import {
  useAllReviewsOfProductQuery,
  useDeleteReviewMutation,
  useNewReviewMutation,
  useProductDetailsQuery,
} from "../redux/api/productApi";
import { addToCart } from "../redux/reducer/cartReducer";
import { userReducerInitialState } from "../types/reducerTypes";
import { CartItem, Review } from "../types/types";
import { responseToast } from "../utils/features";

const ProductDetails = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const params = useParams();
  const dispatch = useDispatch();
  const reviewDialogRef = useRef<HTMLDialogElement>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [createReview] = useNewReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const { isLoading, isError, data } = useProductDetailsQuery(params.id!);
  const reviewsResponse = useAllReviewsOfProductQuery(params.id!);
  const [reviewSubmitLoader, setReviewSubmitLoader] = useState(false);
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

  if (isError) return <Navigate to="/404" />;

  const showDialog = () => {
    reviewDialogRef.current?.showModal();
  };

  const reviewCloseHandler = () => {
    reviewDialogRef.current?.close();
    setRating(0);
    setReviewComment("");
  };

  const {
    Ratings: RatingsEditable,
    rating,
    setRating,
  } = useRating({
    IconFilled: <FaStar />,
    IconOutline: <FaRegStar />,
    value: 0,
    selectable: true,
    styles: {
      fontSize: "1.5rem",
      color: "gold",
      gap: "0.5rem",
      justifyContent: "flex-start",
    },
  });

  const submitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setReviewSubmitLoader(true);
    reviewDialogRef.current?.close();

    const res = await createReview({
      comment: reviewComment,
      rating,
      userId: user?._id,
      productId: params.id!,
    });
    setReviewSubmitLoader(false);
    responseToast(res, null, "");

    setRating(0);
    setReviewComment("");
  };

  const deleteReviewHandler = async (reviewId: string) => {
    const res = await deleteReview({ reviewId, userId: user?._id });
    responseToast(res, null, "");
  };

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
              <em
                style={{ alignItems: "center", display: "flex", gap: "0.5rem" }}
              >
                <RatingsComponent value={data?.product?.ratings || 0} />
                {data?.product.numOfReviews} reviews
              </em>
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

      <dialog ref={reviewDialogRef} className="review-dialog">
        <button onClick={reviewCloseHandler}>X</button>
        <h2>Write a Review</h2>
        <form onSubmit={submitReview}>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Review..."
          ></textarea>
          <RatingsEditable />
          <button disabled={reviewSubmitLoader} type="submit">
            Submit{" "}
          </button>
        </form>
      </dialog>

      <section>
        <article>
          <h2>Reviews</h2>
          {reviewsResponse.isLoading
            ? null
            : user && (
                <button onClick={showDialog}>
                  <FiEdit />
                </button>
              )}
        </article>
        {reviewsResponse.isLoading ? (
          <>
            <SkeletonLoader width="45rem" length={5} />
            <SkeletonLoader width="45rem" length={5} />
            <SkeletonLoader width="45rem" length={5} />
          </>
        ) : (
          reviewsResponse.data?.reviews.map((review) => (
            <ReviewCard
              deleteReviewHandler={deleteReviewHandler}
              userId={user?._id}
              key={review._id}
              review={review}
            />
          ))
        )}
      </section>
    </div>
  );
};

const ReviewCard = ({
  review,
  userId,
  deleteReviewHandler,
}: {
  userId?: string;
  review: Review;
  deleteReviewHandler: (reviewId: string) => void;
}) => {
  return (
    <div className="review">
      <RatingsComponent value={review.rating} />
      <p>{review.comment}</p>
      <div>
        <img src={review.user.photo} alt="user" />
        <small>{review.user.name}</small>
      </div>
      {userId === review.user._id && (
        <button onClick={() => deleteReviewHandler(review._id)}>
          <FaTrash />
        </button>
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
        <SkeletonLoader width="30%" length={3} />
        <SkeletonLoader width="60%" length={4} />
        <SkeletonLoader width="100%" length={6} />
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

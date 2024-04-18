import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { NewOrderRequest } from "../types/apiTypes";
import { useDispatch, useSelector } from "react-redux";
import { userReducerInitialState } from "../types/reducerTypes";
import { RootState } from "../redux/store";
import { useNewOrderMutation } from "../redux/api/orderApi";
import { resetCart } from "../redux/reducer/cartReducer";
import { responseToast } from "../utils/features";

const stripePromise = loadStripe(
  "pk_test_51OxVZZSE7DBQTjxET19dl5ZO7shbM7wXyJ7PuBtDmDYAUMfbDuFt68t8G3eVbnRjc8ZkVh1iA4kuLHxYZ9yBN93500EO53zR2v"
);

const CheckOutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  const clientSecret: string | undefined = location.state;
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [newOrder] = useNewOrderMutation();
  const dispatch = useDispatch();
  const {
    shippingInfo,
    cartItems,
    subtotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cartReducer);
  const { user } = useSelector((state: RootState) => state.userReducer);
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) {
      toast.error("Failed to initialize payment, please try again.");
      return;
    }
    setIsProcessing(true);
    const orderData: NewOrderRequest = {
      shippingInfo,
      orderItems: cartItems,
      subtotal,
      tax,
      discount,
      shippingCharges,
      total,
      user: user?._id!,
    };

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required",
    });
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret!);

    if (error) {
      setIsProcessing(false);
      // console.log(paymentIntent?.status);
      // console.log(error.message);
      return toast.error(error.message || "Something went Wrong");
    }
    if (paymentIntent!.status === "succeeded") {
      const res = await newOrder(orderData);
      dispatch(resetCart);
      // console.log("placing Order ");
      responseToast(res, navigate, "/orders");
    }
    setIsProcessing(false);
  };
  return (
    <div className="checkout-container">
      <form onSubmit={submitHandler}>
        <PaymentElement />
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay"}
        </button>
      </form>
    </div>
  );
};
const CheckOut = () => {
  const location = useLocation();
  const clientSecret: string | undefined = location.state;
  if (!clientSecret) return <Navigate to={"/shipping"} />;
  console.log(location);
  return (
    <Elements
      options={{
        clientSecret,
      }}
      stripe={stripePromise}
    >
      <CheckOutForm />
    </Elements>
  );
};

export default CheckOut;

import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CartItemCard from "../components/CartItem";
import {
  addToCart,
  calculatePrice,
  removeCartItem,
} from "../redux/reducer/cartReducer";
import { cartReducerInitialState } from "../types/reducerTypes";
import { CartItem } from "../types/types";

const Cart = () => {
  const { cartItems, discount, shippingCharges, subtotal, tax, total } =
    useSelector(
      (state: { cartReducer: cartReducerInitialState }) => state.cartReducer
    );
  const dispatch = useDispatch();
  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidCouponCode, setIsValidCouponCode] = useState<boolean>(false);

  const incrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity >= cartItem.stock) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity + 1 }));
  };

  const decrementHandler = (cartItem: CartItem) => {
    if (cartItem.quantity <= 1) return;
    dispatch(addToCart({ ...cartItem, quantity: cartItem.quantity - 1 }));
  };

  const removeHandler = (productId: string) => {
    dispatch(removeCartItem(productId));
  };

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      if (Math.random() > 0.5) setIsValidCouponCode(true);
      else setIsValidCouponCode(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutID);
      setIsValidCouponCode(false);
    };
  }, [couponCode]);

  useEffect(() => {
    dispatch(calculatePrice());
  }, [cartItems]);

  return (
    <div className="cart">
      <main>
        {cartItems.length > 0 ? (
          cartItems.map((i, idx) => (
            <CartItemCard
              incrementHandler={incrementHandler}
              decrementHandler={decrementHandler}
              removeHandler={removeHandler}
              key={idx}
              cartItem={i}
            />
          ))
        ) : (
          <h1>Please add items to view here.</h1>
        )}
      </main>

      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping charges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>
        <p>
          Discount: <em>- ₹{discount}</em>
        </p>
        <p>
          <b>Total: ₹{total}</b>
        </p>
        <input
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        {couponCode &&
          (isValidCouponCode ? (
            <span className="green">
              ₹{discount} off using the code <code>{couponCode}</code>
            </span>
          ) : (
            <span className="red">
              <VscError /> Invalid Coupon code
            </span>
          ))}

        {cartItems.length > 0 && <Link to="/shipping">Checkout</Link>}
      </aside>
    </div>
  );
};

export default Cart;

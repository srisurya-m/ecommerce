import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import CartItem from "../components/CartItem";
import { Link } from "react-router-dom";

const cartItems = [
  {
    productId:"cbdwi",
    photo: "https://m.media-amazon.com/images/I/51rsV94YVCL._SX679_.jpg",
    name:"Hp Spectre",
    price: 3000,
    quantity: 4,
    stock: 10,
  }


];
const subtotal = 4000;
const tax = Math.round(subtotal * 0.18);
const shippingcharges = 200;
const discount = 400;
const total = subtotal + tax + shippingcharges;

const Cart = () => {
  const [couponCode, setCouponCode] = useState<string>("");
  const [isValidCouponCode, setIsValidCouponCode] = useState<boolean>(false);

  useEffect(() => {
    const timeoutID = setTimeout(() => {
      if (Math.random() > 0.5) setIsValidCouponCode(true);
      else setIsValidCouponCode(false);
    }, 1000);

    return () => {
      clearTimeout(timeoutID)
      setIsValidCouponCode(false)
    };
  }, [couponCode]);

  return (
    <div className="cart">
      <main>
        {
          cartItems.length>0 ?
          (
          cartItems.map((i,idx)=>
          <CartItem key={idx} cartItem={i} />)
           ) :
          <h1>Please add items to view here.</h1>
        }
      </main>

      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping charges: ₹{shippingcharges}</p>
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

          {
            cartItems.length>0 && <Link to="/shipping">Checkout</Link>
          }
      </aside>
    </div>
  );
};

export default Cart;

import axios from "axios";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { server } from "../../../redux/store";
import { userReducerInitialState } from "../../../types/reducerTypes";

const newdiscount = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const navigate = useNavigate();
  const [btnLoading, setBtnLoading] = useState(false);

  const [codeUpdate, setCodeUpdate] = useState("");
  const [amountUpdate, setAmountUpdate] = useState(0);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/v1/payment/coupon/new?id=${user?._id}`,
        {
          code: codeUpdate,
          amount: amountUpdate,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (data.success) {
        setCodeUpdate("");
        setAmountUpdate(0);
        toast.success(data.message);
        navigate("/admin/discount");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <>
          <article>
            <form onSubmit={submitHandler}>
              <h2>New Coupon</h2>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={codeUpdate}
                  onChange={(e) => setCodeUpdate(e.target.value)}
                />
              </div>
              <div>
                <label>Price</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amountUpdate}
                  onChange={(e) => setAmountUpdate(Number(e.target.value))}
                />
              </div>

              <button disabled={btnLoading} type="submit">
                Create
              </button>
            </form>
          </article>
        </>
      </main>
    </div>
  );
};

export default newdiscount;

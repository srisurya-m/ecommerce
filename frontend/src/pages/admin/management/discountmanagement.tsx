import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { SkeletonLoader } from "../../../components/Loader";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../../redux/store";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../../../types/reducerTypes";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useFetchData } from "6pp";
import { SingleDiscountResponse } from "../../../types/apiTypes";

const discountmanagement = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    loading: isLoading,
    data,
    error,
  } = useFetchData<SingleDiscountResponse>(
    `${server}/api/v1/payment/coupon/${id}?id=${user?._id}`,
    "discount-code"
  );
  if (error) toast.error(error);
  const [btnLoading, setBtnLoading] = useState(false);

  const [codeUpdate, setCodeUpdate] = useState("");
  const [amountUpdate, setAmountUpdate] = useState(0);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/v1/payment/coupon/${id}?id=${user?._id}`,
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

  const deleteHandler = async () => {
    setBtnLoading(true);
    try {
      const { data } = await axios.delete(
        `${server}/api/v1/payment/coupon/${id}?id=${user?._id}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/admin/discount");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setBtnLoading(false);
    }
  };

  useEffect(() => {
    if (data) {
      setCodeUpdate(data.coupon.code);
      setAmountUpdate(data.coupon.amount);
    }
  }, [data]);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            <article>
              <button className="product-delete-btn" onClick={deleteHandler}>
                <FaTrash />
              </button>
              <form onSubmit={submitHandler}>
                <h2>Manage</h2>
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
                  Update
                </button>
              </form>
            </article>
          </>
        )}
      </main>
    </div>
  );
};

export default discountmanagement;

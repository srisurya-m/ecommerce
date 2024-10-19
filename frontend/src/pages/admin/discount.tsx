import { useFetchData } from "6pp";
import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import { SkeletonLoader } from "../../components/Loader";
import { server } from "../../redux/store";
import { AllDiscountResponse } from "../../types/apiTypes";
import { useSelector } from "react-redux";
import { userReducerInitialState } from "../../types/reducerTypes";

interface DataType {
  code: string;
  amount: number;
  _id: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "ID",
    accessor: "_id",
  },

  {
    Header: "Code",
    accessor: "code",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const discount = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const { data, loading:isLoading, error } = useFetchData<AllDiscountResponse>(
    `${server}/api/v1/payment/coupon/all?id=${user?._id}`,
    "discount-codes"
  );
  const [rows, setRows] = useState<DataType[]>([]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Products",
    rows.length > 6
  )();

  if (error) toast.error(error);
  useEffect(() => {
    if (data) {
      setRows(
        data.coupons.map((i) => ({
          _id: i._id,
          code: i.code,
          amount: i.amount,
          action: <Link to={`/admin/discount/${i._id}`}>Manage</Link>,
        }))
      );
    }
  }, [data]);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading ? <SkeletonLoader /> : Table}</main>
      <Link to="/admin/discount/new" className="create-product-btn">
        <FaPlus />
      </Link>
    </div>
  );
};

export default discount;

import { ReactElement, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Column } from "react-table";
import { SkeletonLoader } from "../../components/Loader";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import {
  useAllUsersQuery,
  useDeleteUserMutation,
} from "../../redux/api/userApi";
import { CustomError } from "../../types/apiTypes";
import { userReducerInitialState } from "../../types/reducerTypes";

interface DataType {
  avatar: ReactElement;
  name: string;
  email: string;
  gender: string;
  role: string;
  action: ReactElement;
}

const columns: Column<DataType>[] = [
  {
    Header: "Avatar",
    accessor: "avatar",
  },
  {
    Header: "Name",
    accessor: "name",
  },
  {
    Header: "Gender",
    accessor: "gender",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Role",
    accessor: "role",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Customers = () => {
  const { user } = useSelector(
    (state: { userReducer: userReducerInitialState }) => state.userReducer
  );
  const { isLoading, data, error, isError } = useAllUsersQuery(user?._id!);
  if (isError) toast.error((error as CustomError).data.message);
  const [rows, setRows] = useState<DataType[]>([]);

  const Table = TableHOC<DataType>(
    columns,
    rows,
    "dashboard-product-box",
    "Customers",
    rows.length > 6
  )();

  const [deleteUser] = useDeleteUserMutation();
  const deleteHandler = async (id: string) => {
    await deleteUser({ userId: id, adminUserId: user?._id! });
    toast.success("User deleted successfully!");
  };

  useEffect(() => {
    if (data)
      setRows(
        data.users.map((i) => ({
          avatar: <img src={i.photo} alt={i.name}/>,
          name: i.name,
          email: i.email,
          gender: i.gender,
          role: i.role,
          action: (
            <button onClick={() => deleteHandler(i._id)}>
              <FaTrash />
            </button>
          ),
        }))
      );
  }, [data]);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>{isLoading ? <SkeletonLoader /> : Table}</main>
    </div>
  );
};

export default Customers;

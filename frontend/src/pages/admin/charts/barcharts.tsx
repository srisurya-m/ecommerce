import { useSelector } from "react-redux";
import { SkeletonLoader } from "../../../components/Loader";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { BarChart } from "../../../components/admin/Charts";
import { useBarQuery } from "../../../redux/api/dashboardApi";
import { RootState } from "../../../redux/store";
import { getLastMonths } from "../../../utils/features";
import { Navigate } from "react-router-dom";



const Barcharts = () => {
  const {last6Months,last12Months} = getLastMonths();
  const { user } = useSelector((state: RootState) => state.userReducer);
  const { isLoading, isError, data } = useBarQuery(user?._id!);
  if (isError) return <Navigate to={"/admin/dashboard"}/>;
  const charts = data?.charts!;
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="chart-container">
        <h1>Bar Charts</h1>
        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <>
            <section>
              <BarChart
                data_2={charts.users}
                data_1={charts.products}
                labels={last6Months}
                title_1="Products"
                title_2="Users"
                bgColor_1={`hsl(260, 50%, 30%)`}
                bgColor_2={`hsl(360, 90%, 90%)`}
              />
              <h2>Top Products & Top Customers</h2>
            </section>

            <section>
              <BarChart
                horizontal={true}
                data_1={charts.orders}
                data_2={[]}
                title_1="Orders"
                title_2=""
                bgColor_1={`hsl(180, 40%, 50%)`}
                bgColor_2=""
                labels={last12Months}
              />
              <h2>Orders throughout the year</h2>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Barcharts;

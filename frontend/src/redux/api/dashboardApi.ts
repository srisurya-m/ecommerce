import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  BarResponse,
  LineResponse,
  PieResponse,
  StatisticsResponse,
} from "../../types/apiTypes";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_SERVER}/api/v1/dashboard/`,
  }),
  endpoints: (builder) => ({
    stats: builder.query<StatisticsResponse, string>({
      query: (id) => `stats?id=${id}`,
      keepUnusedDataFor:0,  // for no caching 
    }),
    pie: builder.query<PieResponse, string>({
      query: (id) => `pie?id=${id}`,
      keepUnusedDataFor:0,
    }),
    bar: builder.query<BarResponse, string>({
      query: (id) => `bar?id=${id}`,
      keepUnusedDataFor:0,
    }),
    line: builder.query<LineResponse,string>({
      query: (id) => `line?id=${id}`,
      keepUnusedDataFor:0,
    }),
  }),
});

export const { useBarQuery, useStatsQuery, usePieQuery, useLineQuery } =
  dashboardApi;

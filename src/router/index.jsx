import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Layout from "@/components/organisms/Layout";

// Lazy load all pages
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Reservations = lazy(() => import("@/components/pages/Reservations"));
const Rooms = lazy(() => import("@/components/pages/Rooms"));
const Guests = lazy(() => import("@/components/pages/Guests"));
const Billing = lazy(() => import("@/components/pages/Billing"));
const Housekeeping = lazy(() => import("@/components/pages/Housekeeping"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-gray-600 font-medium">Loading StayFlow Manager...</p>
    </div>
  </div>
);

const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Dashboard />
      </Suspense>
    )
  },
  {
    path: "reservations",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Reservations />
      </Suspense>
    )
  },
  {
    path: "rooms",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Rooms />
      </Suspense>
    )
  },
  {
    path: "guests",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Guests />
      </Suspense>
    )
  },
  {
    path: "billing",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Billing />
      </Suspense>
    )
  },
  {
    path: "housekeeping",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Housekeeping />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);
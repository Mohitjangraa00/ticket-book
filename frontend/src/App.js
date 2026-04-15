import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import useAuth from "./hooks/useAuth";
import Layout from "./components/layout";

/* ─────────────────────────────────────────
   LAZY IMPORTS
───────────────────────────────────────── */

/* Auth */
const Login          = lazy(() => import("./pages/Login"));
const Register       = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

/* Dashboard & user */
const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Profile        = lazy(() => import("./pages/Profile"));
const MyBookings     = lazy(() => import("./pages/MyBookings"));
const UpcomingEvents = lazy(() => import("./pages/UpcomingEvents"));

/* Train module */
const TrainSearch         = lazy(() => import("./pages/trains/TrainSearch"));
const TrainList           = lazy(() => import("./pages/trains/TrainList"));
const TrainDetails        = lazy(() => import("./pages/trains/TrainDetails"));
const PassengerDetails    = lazy(() => import("./pages/trains/PassengerDetails"));
const BookingSummary      = lazy(() => import("./pages/trains/BookingSummary"));
const BookingConfirmation = lazy(() => import("./pages/trains/BookingConfirmation"));
const PNRStatus           = lazy(() => import("./pages/trains/PNRStatus"));

/* Flight module */
const FlightSearch       = lazy(() => import("./pages/flights/FlightSearch"));
const FlightResults      = lazy(() => import("./pages/flights/FlightResults"));
const FlightDetails      = lazy(() => import("./pages/flights/FlightDetails"));
const FlightPassengers   = lazy(() => import("./pages/flights/FlightPassengers"));
const FlightSummary      = lazy(() => import("./pages/flights/FlightSummary"));
const FlightConfirmation = lazy(() => import("./pages/flights/FlightConfirmation"));
const FlightPNRStatus    = lazy(() => import("./pages/flights/FlightPNRStatus"));

/* Bus module */
const BusSearch             = lazy(() => import("./pages/Buses/BusSearch"));
const BusResults            = lazy(() => import("./pages/Buses/Busresults"));
const BusCard               = lazy(() => import("./pages/Buses/Buscard"));
const BusSeatSelection      = lazy(() => import("./pages/Buses/Busseatselection"));
const BusPassengerDetails   = lazy(() => import("./pages/Buses/Buspassengerdetails"));
const BusBookingSummary     = lazy(() => import("./pages/Buses/Busbookingsummary"));
const BusBookingConfirmation= lazy(() => import("./pages/Buses/Busbookingconfirmation"));
const BusPNRStatus          = lazy(() => import("./pages/Buses/Buspnrstatus"));
const TripPlanner           = lazy(() => import("./pages/TripPlanner"));

/* Other */
const Movies = lazy(() => import("./pages/Movies"));
const Sports = lazy(() => import("./pages/Sports"));
const Hotels = lazy(() => import("./pages/Hotels"));

/* ai features */
import AIAssistant   from "./components/AIAssistant";
import PricePredictor from "./components/PricePredictor";
import useAISearch   from "./hooks/useAISearch";

/* ─────────────────────────────────────────
   PAGE LOADER
───────────────────────────────────────── */
const PageLoader = () => (
  <div style={{
    minHeight: "100vh", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", background: "#f9fafb", gap: 12,
  }}>
    <svg style={{ width: 32, height: 32, animation: "spin 1s linear infinite" }}
      viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
    <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading...</span>
    <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
  </div>
);

/* ─────────────────────────────────────────
   PROTECTED ROUTE
───────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading)          return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

/* ─────────────────────────────────────────
   PUBLIC ROUTE
───────────────────────────────────────── */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading)         return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

/* ─────────────────────────────────────────
   ROUTE TABLES
───────────────────────────────────────── */
const PUBLIC_ROUTES = [
  { path: "/login",           element: <Login /> },
  { path: "/register",        element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
];

const PROTECTED_ROUTES = [
  { path: "/dashboard",  element: <Dashboard /> },
  { path: "/profile",    element: <Profile /> },
  { path: "/bookings",   element: <MyBookings /> },
  { path: "/events",     element: <UpcomingEvents /> },

  { path: "/trains",               element: <TrainSearch /> },
  { path: "/trains/list",          element: <TrainList /> },
  { path: "/trains/details",       element: <TrainDetails /> },
  { path: "/trains/passengers",    element: <PassengerDetails /> },
  { path: "/trains/summary",       element: <BookingSummary /> },
  { path: "/trains/confirmation",  element: <BookingConfirmation /> },
  { path: "/pnr-status",           element: <PNRStatus /> },

  { path: "/flights",              element: <FlightSearch /> },
  { path: "/flights/results",      element: <FlightResults /> },
  { path: "/flights/details",      element: <FlightDetails /> },
  { path: "/flights/passengers",   element: <FlightPassengers /> },
  { path: "/flights/summary",      element: <FlightSummary /> },
  { path: "/flights/confirmation", element: <FlightConfirmation /> },
  { path: "/flights/pnr-status",   element: <FlightPNRStatus /> },

  { path: "/Buses",                    element: <BusSearch /> },
  { path: "/Buses/results",            element: <BusResults /> },
  { path: "/Buses/card",               element: <BusCard /> },
  { path: "/Buses/seat-selection",     element: <BusSeatSelection /> },
  { path: "/Buses/passenger-details",  element: <BusPassengerDetails /> },
  { path: "/Buses/booking-summary",    element: <BusBookingSummary /> },
  { path: "/Buses/confirmation",       element: <BusBookingConfirmation /> },
  { path: "/Buses/pnr-status",         element: <BusPNRStatus /> },

  { path: "/movies", element: <Movies /> },
  { path: "/sports", element: <Sports /> },
  { path: "/hotels", element: <Hotels /> },
  { path: "/trip-planner", element: <TripPlanner /> },
];

/* ─────────────────────────────────────────
   APP ROUTES
───────────────────────────────────────── */
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {PUBLIC_ROUTES.map(({ path, element }) => (
        <Route key={path} path={path} element={<PublicRoute>{element}</PublicRoute>} />
      ))}

      {PROTECTED_ROUTES.map(({ path, element }) => (
        <Route key={path} path={path} element={<ProtectedRoute>{element}</ProtectedRoute>} />
      ))}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </Suspense>
);

/* ─────────────────────────────────────────
   APP
───────────────────────────────────────── */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
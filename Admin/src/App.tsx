import "@ant-design/v5-patch-for-react-19";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Defaultlayout from "./layouts/Defaultlayout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import NoPage from "./pages/NoPage";
import Emptylayout from "./layouts/Emptylayout";
import UserPage from "./pages/UserPage/UserPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import BookingStatusPage from "./pages/BookingStatusPage/BookingStatusPage";
import RoomsPage from "./pages/RoomsPage/RoomsPage";
import RoomTypesPage from "./pages/RoomTypesPage/RoomTypesPage";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import ServiceBookingsPage from "./pages/ServiceBookingsPage/ServiceBookingsPage";
import LocationsPage from "./pages/LocationsPage/LocationsPage";
import ReviewsPage from "./pages/ReviewsPage/ReviewsPage";
import InvoicesPage from "./pages/InvoicesPage/InvoicesPage";
import PaymentsPage from "./pages/PaymentPage/PaymentsPage";
import { useAuthStore } from "./stores/authStore";

function PrivateRoute({ children }) {
  const user = useAuthStore.getState().user;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const user = useAuthStore.getState().user;

  return (
    <BrowserRouter>
      <Routes>
        {/* Nếu chưa login, mặc định vào /login */}
        {!user && <Route path="*" element={<Navigate to="/login" replace />} />}

        {/* Layout mặc định, chỉ vào khi login */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Defaultlayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UserPage />} />
          <Route path="bookings" element={<BookingPage />} />
          <Route path="bookingStatus" element={<BookingStatusPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="room-types" element={<RoomTypesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="service-bookings" element={<ServiceBookingsPage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>

        {/* Layout rỗng cho login */}
        <Route path="/login" element={<Emptylayout />}>
          <Route index element={<LoginPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

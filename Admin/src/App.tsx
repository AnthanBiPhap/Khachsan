import "@ant-design/v5-patch-for-react-19";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Defaultlayout from "./layouts/Defaultlayout";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import NoPage from "./pages/NoPage";
import Emptylayout from "./layouts/Emptylayout";
import UserPage from "./pages/UserPage/UserPage";
import DeletedUsersPage from "./pages/UserPage/DeletedUsersPage";
import BookingPage from "./pages/BookingPage/BookingPage";
import BookingStatusPage from "./pages/BookingStatusPage/BookingStatusPage";
import GuestsPage from "./pages/GuestsPage/GuestsPage";
import RoomsPage from "./pages/RoomsPage/RoomsPage";
import RoomTypesPage from "./pages/RoomTypesPage/RoomTypesPage";
import ServicesPage from "./pages/ServicesPage/ServicesPage";
import ServiceBookingsPage from "./pages/ServiceBookingsPage/ServiceBookingsPage";
import LocationsPage from "./pages/LocationsPage/LocationsPage";
import ReviewsPage from "./pages/ReviewsPage/ReviewsPage";
import InvoicesPage from "./pages/InvoicesPage/InvoicesPage";
import PaymentsPage from "./pages/PaymentPage/PaymentsPage";
import GroupBookingsPage from "./pages/GroupBookingsPage/GroupBookingsPage";
import ChatPage from "./pages/ChatPage/ChatPage";
import AccessDenied from "./pages/AccessDenied";
import { useAuthStore } from "./stores/authStore";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdminOrStaff } = useAuthStore.getState();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdminOrStaff()) return <Navigate to="/access-denied" replace />;
  return children;
}

// Function to check if user has access to specific route
function hasAccessToRoute(userRole: string, path: string): boolean {
  if (userRole === 'admin') {
    return true; // Admin có quyền truy cập tất cả
  } else if (userRole === 'staff') {
    // Staff chỉ được truy cập các route cụ thể
    const allowedPaths = ['/users', '/bookings', '/bookingStatus', '/guests', '/service-bookings', '/invoices', '/group-bookings', '/chat', '/rooms', '/room-types'];
    return allowedPaths.includes(path);
  } else {
    // User thường chỉ được truy cập dashboard
    return path === '/';
  }
}

function RoleProtectedRoute({ children, path }: { children: React.ReactNode; path: string }) {
  const { user } = useAuthStore.getState();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (!hasAccessToRoute(user.role, path)) {
    return <Navigate to="/access-denied" replace />;
  }
  
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
          <Route 
            index 
            element={
              user?.role === 'staff' 
                ? <Navigate to="/bookings" replace /> 
                : <RoleProtectedRoute path="/"><Dashboard /></RoleProtectedRoute>
            } 
          />
          <Route path="users/deleted" element={<RoleProtectedRoute path="/users/deleted"><DeletedUsersPage /></RoleProtectedRoute>} />
          <Route path="users" element={<RoleProtectedRoute path="/users"><UserPage /></RoleProtectedRoute>} />
          <Route path="bookings" element={<RoleProtectedRoute path="/bookings"><BookingPage /></RoleProtectedRoute>} />
          <Route path="bookingStatus" element={<RoleProtectedRoute path="/bookingStatus"><BookingStatusPage /></RoleProtectedRoute>} />
          <Route path="guests" element={<RoleProtectedRoute path="/guests"><GuestsPage /></RoleProtectedRoute>} />
          <Route path="rooms" element={<RoleProtectedRoute path="/rooms"><RoomsPage /></RoleProtectedRoute>} />
          <Route path="room-types" element={<RoleProtectedRoute path="/room-types"><RoomTypesPage /></RoleProtectedRoute>} />
          <Route path="services" element={<RoleProtectedRoute path="/services"><ServicesPage /></RoleProtectedRoute>} />
          <Route path="service-bookings" element={<RoleProtectedRoute path="/service-bookings"><ServiceBookingsPage /></RoleProtectedRoute>} />
          <Route path="locations" element={<RoleProtectedRoute path="/locations"><LocationsPage /></RoleProtectedRoute>} />
          <Route path="reviews" element={<RoleProtectedRoute path="/reviews"><ReviewsPage /></RoleProtectedRoute>} />
          <Route path="invoices" element={<RoleProtectedRoute path="/invoices"><InvoicesPage /></RoleProtectedRoute>} />
          <Route path="payments" element={<RoleProtectedRoute path="/payments"><PaymentsPage /></RoleProtectedRoute>} />
          <Route path="group-bookings" element={<RoleProtectedRoute path="/group-bookings"><GroupBookingsPage /></RoleProtectedRoute>} />
          <Route path="chat" element={<RoleProtectedRoute path="/chat"><ChatPage /></RoleProtectedRoute>} />
        </Route>

        {/* Layout rỗng cho login */}
        <Route path="/login" element={<Emptylayout />}>
          <Route index element={<LoginPage />} />
        </Route>

        {/* Access Denied */}
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* 404 */}
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProductedRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import CreateTicket from "./pages/CreateTicket";
import AdminUser from "./pages/AdminUser";
import AdminDashboardStats from "./pages/AdminDashboardStats";
import { AssignUser } from "./pages/AssignUser";
import AdminUserTickets from "./pages/AdminUserTickets";

function App() {
  const location = useLocation();

  const hideSidebar =
    location.pathname === "/" || location.pathname === "/register";
  return (
    <div>
      <Navbar />
      <div className="flex w-full">
        {!hideSidebar && <Sidebar />}
        <div
          className={`flex-1 py-3 ${
            hideSidebar ? "px-6" : "ml-[198px]"
          } bg-gray-100 min-h-[88vh]`}
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/dashboard" element={
              <ProtectedRoute role="USER">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-ticket" element={
              <ProtectedRoute role="USER">
                <CreateTicket  />
              </ProtectedRoute>
            } />
            <Route path="/assign" element={
              <ProtectedRoute role="USER">
                <AssignUser  />
              </ProtectedRoute>
            } />

            <Route path="/admin/dash" element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboardStats />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/assigned-tickets" element={
              <ProtectedRoute role="ADMIN">
                <AdminUserTickets />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="ADMIN">
                <AdminUser />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>

    </div>
  );
}

export default App;
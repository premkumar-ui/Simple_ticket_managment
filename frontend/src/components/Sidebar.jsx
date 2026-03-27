import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const linkStyle = ({ isActive }) =>
        `text-sm mb-1 p-2 transition ${
            isActive
                ? "bg-gray-700 text-white"
                : "text-gray-300 hover:bg-gray-700"
        }`;

    return (
        <div className="w-44 fixed top-[3.7rem] left-0 h-[calc(100%-3.7rem)] bg-gray-900 text-white flex flex-col p-4 pr-0">

            {user?.role === "ADMIN" && (
                <p className="text-gray-200 text-sm mb-3">Admin Panel</p>
            )}

            <p className="text-gray-400 text-xs mb-3">Menus</p>

            {/* USER MENU */}
            {user?.role === "USER" && (
                <>
                    <NavLink to="/dashboard" className={linkStyle}>
                        My Tickets
                    </NavLink>

                    <NavLink to="/create-ticket" className={linkStyle}>
                        Create Ticket
                    </NavLink>

                    <NavLink to="/assign" className={linkStyle}>
                        Assigned Tickets
                    </NavLink>
                </>
            )}

            {/* ADMIN MENU */}
            {user?.role === "ADMIN" && (
                <>
                    <NavLink to="/admin/dash" className={linkStyle}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/admin/tickets" className={linkStyle}>
                        All Tickets
                    </NavLink>

                    <NavLink to="/admin/assigned-tickets" className={linkStyle}>
                        Assigned Tickets
                    </NavLink>

                    <NavLink to="/admin/users" className={linkStyle}>
                        Users
                    </NavLink>
                </>
            )}

            {/* <button
                onClick={handleLogout}
                className="mt-auto bg-red-500 p-2 rounded hover:bg-red-600"
            >
                Logout
            </button> */}
        </div>
    );
};

export default Sidebar;
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../store/authContext";

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        MilkMS
      </div>
      <nav className="flex-1 p-4 space-y-3">
        {user ? (
          <>
            <Link to="/dashboard" className="block p-2 rounded hover:bg-gray-700">
              Dashboard
            </Link>
            <Link to="/users" className="block p-2 rounded hover:bg-gray-700">
              Users
            </Link>
            <Link to="/signup" className="block p-2 rounded hover:bg-gray-700">
              Create Vendor
            </Link>
            <Link to="/profile/1" className="block p-2 rounded hover:bg-gray-700">
              Profile
            </Link>
          </>
        ) : (
          <Link to="/login" className="block p-2 rounded hover:bg-gray-700">
            Login
          </Link>
        )}
      </nav>
      {user && (
        <button
          onClick={logout}
          className="m-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Sidebar;

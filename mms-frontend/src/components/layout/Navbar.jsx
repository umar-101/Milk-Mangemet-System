// src/components/layout/Navbar.jsx
import React, { useContext } from "react";
import { AuthContext } from "../../store/authContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <h1 className="font-bold">MilkMS</h1>
      <div className="space-x-4">
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/users">Users</Link>
            <Link to="/profile/1">Profile</Link>
            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 rounded ml-4"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 px-3 py-1 rounded"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

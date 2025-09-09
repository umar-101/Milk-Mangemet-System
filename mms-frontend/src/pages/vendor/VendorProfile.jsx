import React, { useState, useEffect } from "react";
import { getVendor, updateVendor } from "../../api/accounts";
import { useAuth } from "../../store/authContext";

export default function VendorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ username: "", email: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getVendor(user.username); // assuming username = id
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateVendor(user.username, profile);
    alert("Profile updated!");
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-4">My Profile</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <input
          type="text"
          name="username"
          value={profile.username}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Save
        </button>
      </form>
    </div>
  );
}

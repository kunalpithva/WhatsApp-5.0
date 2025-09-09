import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-hot-toast";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [editPassword, setEditPassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to fetch profile");
                }
                setUser(data.user);
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchProfile();
    }, []);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordForm({
            ...passwordForm,
            [name]: value,
        });
    };

    const handleUpdatePassword = async () => {
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            toast.error("All fields are required.");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New password and confirm password do not match.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update password");
            }

            toast.success("Password updated successfully!");
            setEditPassword(false);
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />

                <div className="flex-1 flex flex-col items-center p-9">
                    {/* Profile Section */}
                    <div
                        className="w-full max-w-md bg-white mt-6 p-6 rounded-lg text-black border border-gray-400
                                   shadow-2xl shadow-blue-500/50 "
                    >
                        {user ? (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h1 className="text-2xl font-semibold">User Profile</h1>
                                    <div className="flex space-x-3">
                                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full font-semibold">
                                            {user.role}
                                        </span>
                                        <span className="bg-green-400 text-black px-3 py-1 rounded-full font-semibold">
                                            Credits: {user.credits}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p><strong>Username:</strong> {user.username}</p>
                                    <p><strong>Mobile Number:</strong> {user.mobile_number}</p>
                                    <p><strong>Email Address:</strong> {user.email}</p>
                                </div>

                                <div>
                                    {/* Password Section */}
                                    <div className="flex items-center space-x-2">
                                        <strong>Password:</strong>
                                        <span>********</span>
                                        <button
                                            onClick={() => setEditPassword(!editPassword)}
                                            className="text-blue-500 ml-2 bg-white"
                                        >
                                            <FiEdit />
                                        </button>
                                    </div>

                                    {/* Edit Password Form with animation */}
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${editPassword ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
                                            }`}
                                    >
                                        <div className="space-y-2">
                                            {/* Current Password */}
                                            <div className="flex items-center border border-gray-400 rounded-full px-3 py-2">
                                                <input
                                                    type="password"
                                                    name="currentPassword"
                                                    placeholder="Current Password"
                                                    value={passwordForm.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="flex-1 outline-none text-black"
                                                />
                                            </div>

                                            {/* New Password */}
                                            <div className="flex items-center border border-gray-400 rounded-full px-3 py-2">
                                                <input
                                                    type="password"
                                                    name="newPassword"
                                                    placeholder="New Password"
                                                    value={passwordForm.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="flex-1 outline-none text-black"
                                                />
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="flex items-center border border-gray-400 rounded-full px-3 py-2">
                                                <input
                                                    type="password"
                                                    name="confirmPassword"
                                                    placeholder="Confirm Password"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="flex-1 outline-none text-black"
                                                />
                                            </div>

                                            <button
                                                onClick={handleUpdatePassword}
                                                className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p>Loading...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;

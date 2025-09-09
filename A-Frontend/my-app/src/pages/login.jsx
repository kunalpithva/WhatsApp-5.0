import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import axios from "axios";

const AdminLogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [mobile_number, setMobileNumber] = useState(""); // Changed from username to mobile_number
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/admin-login`, {
                mobile_number,
                password,
            });
            localStorage.setItem('token', response.data.token);
            toast.success("Admin Login successful!");
            navigate("/dashboard"); // go to dashboard
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Admin login failed. Please check your credentials and ensure you have admin privileges.";
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-white">
            <div className="bg-white shadow-xl rounded-xl p-10 w-96">
                <h2 className="text-2xl font-semibold text-center mb-8 text-black">
                    Admin Login
                </h2>

                <form onSubmit={handleLogin}>
                    {/* Mobile Number */}
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={mobile_number}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className="w-full px-4 py-2 mb-5 border border-gray-400 rounded-full 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 
                       placeholder-gray-500 text-black"
                    />

                    {/* Password */}
                    <div className="relative mb-5">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 pr-12 border border-gray-400 rounded-full 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         placeholder-gray-500 text-black"
                        />

                        {password && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-blue-600 
                           focus:outline-none bg-transparent border-none p-0 m-0"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-full font-semibold hover:bg-blue-600 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;

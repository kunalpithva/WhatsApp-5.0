import React, { useState ,useEffect} from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { CiPhone, CiMail, CiLock } from "react-icons/ci";
import { toast, Toaster } from "react-hot-toast";

const CreateAccount = () => {
    const [accountType, setAccountType] = useState("user");
    const [showPassword, setShowPassword] = useState(false);
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "/";
    }
    const [user, setUser] = useState(null); // State to store user data
    
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
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        mobileNo: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validatePassword = (password) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation logic
        if (!formData.firstName) newErrors.firstName = "First name is required.";
        if (!formData.lastName) newErrors.lastName = "Last name is required.";
        if (!formData.mobileNo) {
            newErrors.mobileNo = "Mobile number is required.";
        } else if (!/^\d{10}$/.test(formData.mobileNo)) {
            newErrors.mobileNo = "Enter a valid 10-digit mobile number.";
        }
        if (!formData.email) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email address is invalid.";
        }
        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (!validatePassword(formData.password)) {
            newErrors.password =
                "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 digit, and 1 special character.";
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

            try {
                const token = localStorage.getItem("token"); // Get the token
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/createaccount`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Add Authorization header
                    },
                    body: JSON.stringify({
                        username: `${formData.firstName}${formData.lastName}`,
                        email: formData.email,
                        mobile_number: formData.mobileNo,
                        role: accountType,
                        password: formData.password,
                        confirmPassword: formData.confirmPassword,
                    }),
                });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            toast.success("Account created successfully!");

            setFormData({
                firstName: "",
                lastName: "",
                mobileNo: "",
                email: "",
                password: "",
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
                <Header title="Create Account" />

                <div className="px-10 mt-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">
                        Create Account
                    </h1>
                </div>

                <div className="flex-1 p-10">
                    <div className="bg-white rounded-2xl shadow-2xl shadow-blue-300 p-8 max-w-md mx-auto">
                        

                        <div className="flex justify-center mb-6 space-x-4">
                            <button
                                onClick={() => setAccountType("user")}
                                type="button"
                                className={`px-5 py-2 rounded-full border ${accountType === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-gray-700 border-gray-300"
                                    } transition`}
                            >
                                User Account
                            </button>
                            <button
                                onClick={() => setAccountType("reseller")}
                                type="button"
                                className={`px-5 py-2 rounded-full border ${accountType === "reseller"
                                    ? "bg-blue-500 text-white"
                                    : "bg-white text-gray-700 border-gray-300"
                                    } transition`}
                            >
                                Reseller Account
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition text-gray-700">
                                    <FaUser className="text-gray-500 mr-2" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="flex-1 outline-none placeholder-gray-700 text-black"
                                    />
                                </div>
                                <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition text-gray-700">
                                    <FaUser className="text-gray-500 mr-2" />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="flex-1 outline-none placeholder-gray-700 text-black"
                                    />
                                </div>
                            </div>
                            {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
                            {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}

                            {/* Mobile Number */}
                            <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition text-gray-700">
                                <CiPhone className="text-gray-500 mr-2" />
                                <input
                                    type="text"
                                    name="mobileNo"
                                    placeholder="Mobile Number"
                                    value={formData.mobileNo}
                                    maxLength={10}
                                    onChange={handleInputChange}
                                    className="flex-1 outline-none placeholder-gray-700 text-black"
                                />
                            </div>
                            {errors.mobileNo && <p className="text-red-500 text-xs">{errors.mobileNo}</p>}

                            {/* Email */}
                            <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition text-gray-700">
                                <CiMail className="text-gray-500 mr-2" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="flex-1 outline-none placeholder-gray-700 text-black"
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}

                            {/* Password */}
                            <div className="relative flex items-center border border-gray-300 rounded-full px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition text-gray-700">
                                <CiLock className="text-gray-500 mr-2 bg-white" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="flex-1 outline-none placeholder-gray-700 text-black"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-gray-500 bg-transparent border-none"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}

                            {/* Confirm Password */}
                            <div className="relative flex items-center border border-gray-300 rounded-full px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition text-gray-700">
                                <CiLock className="text-gray-500 mr-2" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="flex-1 outline-none placeholder-gray-700 text-black"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-gray-500 bg-transparent border-none"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-500 border-gray-300 text-white py-3 rounded-full hover:bg-blue-600 transition"
                            >
                                Create An Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Toast container */}
            <Toaster reverseOrder={false} />
        </div>
    );
};

export default CreateAccount;

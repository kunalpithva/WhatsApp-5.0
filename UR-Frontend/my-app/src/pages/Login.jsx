import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [mobile_number, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        const loginPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        mobile_number,
                        password,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    reject(new Error(data.error || "Something went wrong"));
                    return;
                }

                localStorage.setItem("token", data.token);
                navigate("/dashboard");
                resolve("Logged in successfully!");
            } catch (err) {
                reject(err);
            }
        });

        toast.promise(loginPromise, {
            loading: "Logging in...",
            success: (message) => message,
            error: (err) => {
                setError(err.message);
                return err.message;
            },
        });
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-white">
            <div className="bg-white shadow-xl rounded-xl p-10 w-96">
                <h2 className="text-2xl font-semibold text-center mb-8 text-black">
                    Login
                </h2>

                <form onSubmit={handleLogin}>
                    {/* Username */}
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={mobile_number}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className="w-full px-4 py-2 mb-5 border border-gray-400 rounded-full 
                       focus:outline-none bg-white focus:ring-2 focus:ring-blue-500 
                       text-black"
                    />

                    {/* Password */}
                    <div className="relative mb-5">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 pr-12 border border-gray-400 rounded-full 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         bg-white text-black"
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

                <p className="text-center mt-5 text-sm text-gray-600 cursor-pointer hover:underline">
                    Forgot Password ?
                </p>
            </div>
        </div>
    );
};

export default Login;

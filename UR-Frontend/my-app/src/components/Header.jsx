import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";

const Header = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const [username, setUsername] = useState("Guest"); // Default username

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setUsername("Guest");
                    return;
                }
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (response.ok && data.user) {
                    setUsername(data.user.username);
                } else {
                    setUsername("Guest");
                    console.error("Failed to fetch profile:", data.error);
                }
            } catch (error) {
                setUsername("Guest");
                console.error("Error fetching profile:", error);
            }
        };
        fetchProfile();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <header className="flex justify-end items-center bg-white px-8 py-4 border-b border-gray-300 relative">
            <div ref={dropdownRef} className="relative">
                {/* Trigger */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setOpen(!open)}
                >
                    <span className="font-semibold text-lg text-black">{username}</span>
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-black">👤</span>
                    </div>
                </div>

                {/* Dropdown with animation */}
                <div
                    className={`absolute top-14 right-0 w-44 bg-white shadow-lg rounded-md border border-gray-200 transform transition-all duration-200 origin-top-right ${open
                        ? "opacity-100 scale-100 visible"
                        : "opacity-0 scale-95 invisible"
                        }`}
                >
                    <ul className="flex flex-col text-black">
                        <li
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                setOpen(false);
                                navigate("/profile");
                            }}
                        >
                            <CiUser size={18} /> Profile
                        </li>
                        <li
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={handleLogout}
                        >
                            <IoIosLogOut size={18} /> Logout
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;

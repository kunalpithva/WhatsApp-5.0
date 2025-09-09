import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { RiArrowDropRightLine } from "react-icons/ri";
import { toast } from "react-hot-toast";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

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

    // Open submenu if the current path is under WhatsApp menu
    useEffect(() => {
        if (
            location.pathname.includes("/with") ||
            location.pathname.includes("/without")
        ) {
            setMenuOpen(true);
        } else {
            setMenuOpen(false);
        }
    }, [location.pathname]);

    const baseClasses =
        "px-6 py-3 cursor-pointer rounded-r-full transition-colors";
    const activeClasses = "bg-blue-500 text-white";
    const inactiveClasses = "text-black hover:bg-gray-200";

    return (
        <aside className="w-64 bg-white border-r border-gray-300 flex flex-col h-screen">
            {/* Logo */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-300">
                <img className="w-10 h-10" alt="logo" />
                <h1 className="text-xl font-bold text-black">Send Message</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-6 overflow-y-auto">
                <ul>
                    {/* Dashboard */}
                    <li
                        className={`${baseClasses} ${location.pathname === "/dashboard"
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => navigate("/dashboard")}
                    >
                        Dashboard
                    </li>

                    {/* WhatsApp Menu */}
                    <li
                        className={`${baseClasses} flex justify-between items-center text-nowrap ${location.pathname.includes("/with") ||
                            location.pathname.includes("/without")
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span>Send WhatsApp Message</span>
                        <span
                            className={`transition-transform duration-300 ${menuOpen ? "rotate-90" : ""
                                }`}
                        >
                            <IoIosArrowForward />
                        </span>
                    </li>

                    {/* WhatsApp Submenu */}
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                            }`}
                    >
                        <div className="flex flex-col pl-10 mt-2 text-sm space-y-2">
                            <span
                                className={`cursor-pointer flex items-center rounded-md px-2 py-1 ${location.pathname === "/withoutbutton"
                                    ? "bg-blue-100 text-black"
                                    : "text-black hover:bg-gray-200"
                                    }`}
                                onClick={() => navigate("/withoutbutton")}
                            >
                                <RiArrowDropRightLine size={20} /> Without Button
                            </span>
                            <span
                                className={`cursor-pointer rounded-md flex items-center px-2 py-1 text-nowrap ${location.pathname === "/withbutton"
                                    ? "bg-blue-100 text-black"
                                    : "text-black hover:bg-gray-200"
                                    }`}
                                onClick={() => navigate("/withbutton")}
                            >
                                <RiArrowDropRightLine size={20} /> With Button
                            </span>
                        </div>
                    </div>

                    {/* Campaign (Main Item) */}
                    <li
                        className={`${baseClasses} ${location.pathname === "/campaign"
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => navigate("/campaign")}
                    >
                        Campaign
                    </li>

                    {/* Create Account */}
                    {user && user.role !== "user" && (
                        <li
                            className={`${baseClasses} ${location.pathname === "/createaccount"
                                ? activeClasses
                                : inactiveClasses
                                }`}
                            onClick={() => navigate("/createaccount")}
                        >
                            Create Account
                        </li>
                    )}

                    {/* Manage User */}
                    {user && user.role !== "user" && (
                        <li
                            className={`${baseClasses} ${location.pathname === "/manageuser"
                                ? activeClasses
                                : inactiveClasses
                                }`}
                            onClick={() => navigate("/manageuser")}
                        >
                            Manage User
                        </li>
                    )}

                    {/* Suspicious Activities (Admin Only) */}
                    {user && user.role === "admin" && (
                        <li
                            className={`${baseClasses} ${location.pathname === "/suspiciousactivity"
                                ? activeClasses
                                : inactiveClasses
                                }`}
                            onClick={() => navigate("/suspiciousactivity")}
                        >
                            Suspicious Activities
                        </li>
                    )}

                    {/* Profile */}
                    <li
                        className={`${baseClasses} ${location.pathname === "/profile"
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => navigate("/profile")}
                    >
                        Profile
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;

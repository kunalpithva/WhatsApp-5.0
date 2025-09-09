import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

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

                    {/* All Campaign */}
                    <li
                        className={`${baseClasses} ${location.pathname === "/allcampaign"
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => navigate("/allcampaign")}
                    >
                        All Campaign
                    </li>

                    {/* Create Account */}
                    <li
                        className={`${baseClasses} ${location.pathname === "/createaccount"
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => navigate("/createaccount")}
                    >
                        Create Account
                    </li>

                    {/* Manage User */}
                    <li
                        className={`${baseClasses} ${location.pathname === "/manageuser"
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => navigate("/manageuser")}
                    >
                        Manage User
                    </li>

                    {/* Suspicious */}
                    <li
                        className={`${baseClasses} ${location.pathname === "/suspicious"
                            ? activeClasses
                            : inactiveClasses
                            }`}
                        onClick={() => navigate("/suspicious")}
                    >
                        Suspicious
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;

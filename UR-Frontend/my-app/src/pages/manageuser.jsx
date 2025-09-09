import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CiDollar, CiSearch } from "react-icons/ci";
import { IoTrashOutline, IoClose } from "react-icons/io5";
import { toast } from "react-hot-toast";

const ManageUser = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState(null);
    const [currentUserCredits, setCurrentUserCredits] = useState(0); // New state for current user's own credits
    const [resellerCreditSummary, setResellerCreditSummary] = useState(null);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [creditChange, setCreditChange] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const inputRef = useRef(null);
    const popupRef = useRef(null);

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Authentication token missing.");
                    return;
                }

                // Fetch current user's profile to get their role
                const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const profileData = await profileResponse.json();
                if (!profileResponse.ok) {
                    throw new Error(profileData.error || "Failed to fetch user profile");
                }
                setCurrentUserRole(profileData.user.role);
                setCurrentUserCredits(profileData.user.credits); // Set current user's own credits

                // Fetch reseller credit summary if the user is a reseller
                if (profileData.user.role === 'reseller') {
                    const summaryResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resellercreditsummary`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const summaryData = await summaryResponse.json();
                    if (!summaryResponse.ok) {
                        throw new Error(summaryData.error || "Failed to fetch reseller credit summary");
                    }
                    setResellerCreditSummary(summaryData);
                }

                // Fetch users based on the logged-in user's role (backend handles filtering)
                const usersResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/allusers`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const usersData = await usersResponse.json();
                if (!usersResponse.ok) {
                    throw new Error(usersData.error || "Failed to fetch users");
                }
                setUsers(usersData.users);
                setFilteredUsers(usersData.users);
            } catch (error) {
                toast.error(error.message);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = users.filter((user) =>
            Object.values(user).some((value) =>
                value.toString().toLowerCase().includes(term)
            )
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    useEffect(() => {
        if (showPopup && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showPopup]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                handleClosePopup();
                handleCloseDeletePopup();
            }
        };

        if (showPopup || showDeletePopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPopup, showDeletePopup]);

    const clearSearch = () => setSearchTerm("");

    const handleOpenPopup = (user) => {
        setSelectedUser(user);
        setCreditChange("");
        setErrorMessage("");
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setSelectedUser(null);
        setCreditChange("");
        setErrorMessage("");
    };

    const handleAddCredits = async () => {
        const amount = parseInt(creditChange, 10);

        if (isNaN(amount) || amount === 0) {
            setErrorMessage("Please enter a positive or negative number");
            return;
        }

        if (selectedUser) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/manageusers`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        userId: selectedUser._id,
                        creditChange: amount,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to update credits");
                }

                // Update the target user's credits in the state
                const updatedUsers = users.map((user) =>
                    user._id === selectedUser._id ? { ...user, credits: data.newCredits } : user
                );
                setUsers(updatedUsers);
                setFilteredUsers(updatedUsers);

                // Update the reseller's own credits in the state
                setCurrentUserCredits(data.resellerNewCredits);

                toast.success(`Credits updated for ${selectedUser.username}`);
                handleClosePopup();
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const handleOpenDeletePopup = (user) => {
        setSelectedUser(user);
        setShowDeletePopup(true);
    };

    const handleCloseDeletePopup = () => {
        setShowDeletePopup(false);
        setSelectedUser(null);
    };

    const handleDeleteUser = async () => {
        if (selectedUser) {
            const deletePromise = new Promise(async (resolve, reject) => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/deleteuser/${selectedUser._id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || "Failed to delete user");
                    }

                    // Update the users list in the state
                    const updatedUsers = users.filter((user) => user._id !== selectedUser._id);
                    setUsers(updatedUsers);
                    setFilteredUsers(updatedUsers);

                    resolve(`User "${selectedUser.username}" deleted successfully!`);
                } catch (error) {
                    reject(error);
                }
            });

            toast.promise(deletePromise, {
                loading: "Deleting user...",
                success: (message) => message,
                error: (err) => err.message,
            });
            handleCloseDeletePopup();
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4 text-black">Manage User</h1>
                    {currentUserRole === 'reseller' && (
                        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
                            <p className="font-bold">Your Current Credits: <span className="font-semibold">{currentUserCredits}</span></p>
                            {resellerCreditSummary && (
                                <>
                                    <p className="font-bold mt-2">Reseller Summary (Referred Users)</p>
                                    <p>Total Credits: <span className="font-semibold">{resellerCreditSummary.totalCredits}</span></p>
                                    <p>Number of Referred Users: <span className="font-semibold">{resellerCreditSummary.referredUsersCount}</span></p>
                                </>
                            )}
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-4">
                        {currentUserRole === 'reseller' && ( // Only show "Add User" button for resellers
                            <button
                                onClick={() => navigate("/createaccount")}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full font-semibold shadow-sm text-sm"
                            >
                                Add User
                            </button>
                        )}
                        <div className="relative w-60">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <CiSearch size={20} />
                            </span>
                            <input
                                type="text"
                                placeholder="Search by any field..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-8 py-2 border border-gray-400 rounded-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 font-bold bg-white rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-lg shadow-md">
                        <table className="w-full border-collapse bg-white text-sm rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-blue-500 text-white text-left">
                                    <th className="px-2 py-1 border border-gray-300">Sr. No</th>
                                    <th className="px-2 py-1 border border-gray-300">Username</th>
                                    <th className="px-2 py-1 border border-gray-300">Mobile Number</th>
                                    <th className="px-2 py-1 border border-gray-300">Email</th>
                                    <th className="px-2 py-1 border border-gray-300">Role</th>
                                    <th className="px-2 py-1 border border-gray-300">Creation Date</th>
                                    <th className="px-2 py-1 border border-gray-300">Credits</th>
                                    <th className="px-2 py-1 border border-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, idx) => (
                                        <tr key={user._id} className="hover:bg-gray-100 transition-colors text-black">
                                            <td className="px-2 py-1 border border-gray-300">{String(idx + 1).padStart(2, "0")}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.username}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.mobile_number}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.email}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.role}</td>
                                            <td className="px-2 py-1 border border-gray-300">{new Date(user.creationdate).toLocaleDateString()}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.credits}</td>
                                            <td className="px-2 py-1 border border-gray-300 flex justify-center items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenPopup(user)}
                                                    className="flex justify-center items-center text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded-full border border-green-600 hover:border-green-800 bg-white"
                                                >
                                                    <CiDollar />
                                                </button>

                                                <button
                                                    onClick={() => handleOpenDeletePopup(user)}
                                                    className="flex justify-center items-center text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded-full border border-red-600 hover:border-red-800 bg-white"
                                                >
                                                    <IoTrashOutline />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center py-4 text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Credit Popup Modal */}
            {showPopup && selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={popupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-96"
                    >
                        <button
                            onClick={handleClosePopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            Update Credits for {selectedUser.username}
                        </h2>
                        <p className="mb-2 text-gray-700">
                            Current Credits:{" "}
                            <span className="font-semibold">{selectedUser.credits}</span>
                        </p>

                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-medium text-gray-600">
                                Enter Credits to Increase / Decrease
                            </label>
                            <input
                                ref={inputRef}
                                type="number"
                                value={creditChange}
                                onChange={(e) => setCreditChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleAddCredits();
                                    }
                                }}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 text-gray-600 focus:ring-blue-400"
                                placeholder="e.g. 50 or -20"
                            />
                            {errorMessage && (
                                <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleClosePopup}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCredits}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Update Credits
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Popup */}
            {showDeletePopup && selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={popupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-96"
                    >
                        <button
                            onClick={handleCloseDeletePopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            Delete User {selectedUser.name}?
                        </h2>
                        <p className="mb-4 text-gray-700">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCloseDeletePopup}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUser;

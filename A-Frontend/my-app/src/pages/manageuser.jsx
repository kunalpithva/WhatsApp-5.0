import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CiDollar, CiSearch } from "react-icons/ci";
import { IoTrashOutline, IoClose } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";

const ManageUser = () => {
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState([]); // State to hold all users fetched from API
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [creditChange, setCreditChange] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const inputRef = useRef(null);
    const popupRef = useRef(null);

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showResellerProfilePopup, setShowResellerProfilePopup] = useState(false);
    const [selectedResellerProfile, setSelectedResellerProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        const fetchUsersPromise = new Promise(async (resolve, reject) => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found.");
                }

                const response = await fetch(`${API_URL}/api/auth/allusers`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch users.");
                }

                const data = await response.json();
                setAllUsers(data.users); // Assuming the API returns an object with a 'users' array
                setFilteredUsers(data.users);
                resolve("Users loaded successfully!");
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err.message);
                reject(err.message);
            } finally {
                setLoading(false);
            }
        });

        toast.promise(fetchUsersPromise, {
            loading: "Loading users...",
            success: (message) => message,
            error: (err) => `Error: ${err}`,
        });
    };

    const fetchResellerProfile = async (resellerId) => {
        const fetchResellerPromise = new Promise(async (resolve, reject) => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token found.");
                }

                const response = await fetch(`${API_URL}/api/auth/users/${resellerId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch reseller profile.");
                }

                const data = await response.json();
                setSelectedResellerProfile(data.reseller); // Assuming API returns { reseller: {...} }
                resolve("Reseller profile loaded successfully!");
            } catch (err) {
                console.error("Error fetching reseller profile:", err);
                reject(err.message);
            }
        });

        toast.promise(fetchResellerPromise, {
            loading: "Loading reseller profile...",
            success: (message) => message,
            error: (err) => `Error: ${err}`,
        });
    };

    useEffect(() => {
        fetchUsers();
    }, [API_URL]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
    const filtered = allUsers.filter((user) =>
        Object.values(user).some((value) => {
            // Ensure value is not null or undefined before calling toString()
            if (value === null || value === undefined) {
                return false;
            }
            return value.toString().toLowerCase().includes(term);
        })
    );
        setFilteredUsers(filtered);
    }, [searchTerm, allUsers]); // Depend on allUsers to re-filter when data changes

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
                handleCloseResellerProfilePopup();
            }
        };

        if (showPopup || showDeletePopup || showResellerProfilePopup) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPopup, showDeletePopup, showResellerProfilePopup]);

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
            const updateCreditsPromise = new Promise(async (resolve, reject) => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        throw new Error("No authentication token found.");
                    }

                    const response = await fetch(`${API_URL}/api/auth/users/${selectedUser._id}/credits`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ amount }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to update credits.");
                    }

                    // After successful update, re-fetch users to get the latest data
                    await fetchUsers();
                    resolve(`Credits updated for "${selectedUser.username}"`);
                } catch (err) {
                    console.error("Error updating credits:", err);
                    reject(err.message);
                }
            });

            toast.promise(updateCreditsPromise, {
                loading: "Updating credits...",
                success: (message) => {
                    handleClosePopup();
                    return message;
                },
                error: (err) => `Error: ${err}`,
            });
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
            const deleteUserPromise = new Promise(async (resolve, reject) => {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        throw new Error("No authentication token found.");
                    }

                    const response = await fetch(`${API_URL}/api/auth/users/${selectedUser._id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || "Failed to delete user.");
                    }

                    // After successful deletion, re-fetch users
                    await fetchUsers();
                    resolve(`User "${selectedUser.username}" deleted`);
                } catch (err) {
                    console.error("Error deleting user:", err);
                    reject(err.message);
                }
            });

            toast.promise(deleteUserPromise, {
                loading: "Deleting user...",
                success: (message) => {
                    handleCloseDeletePopup();
                    return message;
                },
                error: (err) => `Error: ${err}`,
            });
        }
    };

    const handleOpenResellerProfile = (resellerId) => {
        fetchResellerProfile(resellerId);
        setShowResellerProfilePopup(true);
    };

    const handleCloseResellerProfilePopup = () => {
        setShowResellerProfilePopup(false);
        setSelectedResellerProfile(null);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Toaster />
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <Header />
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-4 text-black">Manage User</h1>
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate("/createaccount")}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full font-semibold shadow-sm text-sm"
                        >
                            Add User
                        </button>
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

                    <div className="h-[70vh] overflow-auto rounded-lg shadow-md">
                        <table className="w-full border-collapse bg-white text-sm rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-blue-500 text-white text-left sticky top-0">
                                    <th className="px-2 py-1 border border-gray-300">Sr. No</th>
                                    <th className="px-2 py-1 border border-gray-300">Name</th>
                                    <th className="px-2 py-1 border border-gray-300">Reseller Name</th>
                                    <th className="px-2 py-1 border border-gray-300">Number</th>
                                    <th className="px-2 py-1 border border-gray-300">Email</th>
                                    <th className="px-2 py-1 border border-gray-300">Type</th>
                                    <th className="px-2 py-1 border border-gray-300">Date</th>
                                    <th className="px-2 py-1 border border-gray-300">Credit</th>
                                    <th className="px-2 py-1 border border-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody className="h-[70vh]">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4 text-red-500">
                                            Error: {error}
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, idx) => (
                                        <tr key={user._id} className="hover:bg-gray-100 transition-colors text-black">
                                            <td className="px-2 py-1 border border-gray-300">{String(idx + 1).padStart(2, "0")}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.username}</td>
                                            <td className="px-2 py-1 border border-gray-300">
                                                {user.referanceid ? (
                                                    <button
                                                        onClick={() => handleOpenResellerProfile(user.referanceid)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {user.resellerName || user.referanceid}
                                                    </button>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-300">{user.mobile_number}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.email}</td>
                                            <td className="px-2 py-1 border border-gray-300">{user.role}</td>
                                            <td className="px-2 py-1 border border-gray-300">
                                            {new Date(user.creationdate).toLocaleDateString()}
                                            </td>
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
                                        <td colSpan="9" className="text-center py-4 text-gray-500">
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
                            Delete User {selectedUser.username}?
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

            {/* Reseller Profile Popup Modal */}
            {showResellerProfilePopup && selectedResellerProfile && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={popupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-96"
                    >
                        <button
                            onClick={handleCloseResellerProfilePopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            Reseller Profile: {selectedResellerProfile.username}
                        </h2>
                        <div className="text-gray-700">
                            <p><strong>Email:</strong> {selectedResellerProfile.email}</p>
                            <p><strong>Mobile:</strong> {selectedResellerProfile.mobile_number}</p>
                            <p><strong>Role:</strong> {selectedResellerProfile.role}</p>
                            <p><strong>Creation Date:</strong> {selectedResellerProfile.creationdate}</p>
                            <p><strong>Credits:</strong> {selectedResellerProfile.credits}</p>
                            {/* Add more reseller details as needed */}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={handleCloseResellerProfilePopup}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUser;

// File: src/pages/allcampaign.jsx
import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { CiEdit, CiSearch, CiImport } from "react-icons/ci";
import { IoTrashOutline, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import axios from "axios";

// Status options with colors
const statusOptions = [
    { name: "Compeleted", color: "bg-green-100 text-green-700" },
    { name: "Pending", color: "bg-orange-100 text-orange-700" },
    { name: "Cancelled", color: "bg-red-300 text-red-900" },
    { name: "Running", color: "bg-gray-400 text-white" },
];

const AllCampaign = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [campaigns, setCampaigns] = useState([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState([]);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [showDeductCreditPopup, setShowDeductCreditPopup] = useState(false); // New state for deduct credit popup
    const [deductAmount, setDeductAmount] = useState(""); // State for deduction amount input
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // new state for message popup
    const [showMessagePopup, setShowMessagePopup] = useState(false);
    const [selectedMessageCampaign, setSelectedMessageCampaign] = useState(null);

    const deletePopupRef = useRef(null);
    const editPopupRef = useRef(null);
    const messagePopupRef = useRef(null);
    const deductCreditPopupRef = useRef(null); // New ref for deduct credit popup

    // Fetch campaigns from API
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found.');
                }
                const promise = axios.get(`${import.meta.env.VITE_API_URL}/api/auth/a_campaigns`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                toast.promise(promise, {
                    loading: 'Fetching campaigns...',
                    success: 'Campaigns loaded!',
                    error: 'Failed to load campaigns.',
                });

                const response = await promise;
                // Add a 'withButton' property based on whether deductedCredits exist
                const campaignsWithButtonInfo = response.data.campaigns.map(campaign => ({
                    ...campaign,
                    withButton: campaign.deductedCredits > 0 // Assuming campaigns with deducted credits are "with button"
                }));
                setCampaigns(campaignsWithButtonInfo);
            } catch (err) {
                setError(err.message || 'Failed to fetch campaigns.');
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    // Filter campaigns by search
    useEffect(() => {
        const filtered = campaigns.filter((c) =>
            Object.values(c).some((val) =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setFilteredCampaigns(filtered);
    }, [searchTerm, campaigns]);

    const clearSearch = () => setSearchTerm("");

    const handleOpenDeletePopup = (campaign) => {
        setSelectedCampaign(campaign);
        setShowDeletePopup(true);
    };

    const handleCloseDeletePopup = () => {
        setShowDeletePopup(false);
        setSelectedCampaign(null);
    };

    const handleDeleteCampaign = async () => {
        if (selectedCampaign) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found.');
                }
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/campaigns/${selectedCampaign._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const updatedCampaigns = campaigns.filter((c) => c._id !== selectedCampaign._id);
                setCampaigns(updatedCampaigns);
                toast.success(`Campaign "${selectedCampaign.campaignname}" deleted`);
                handleCloseDeletePopup();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to delete campaign.');
            }
        }
    };

    const handleOpenEditPopup = (campaign) => {
        setSelectedCampaign(campaign);
        setShowEditPopup(true);
    };

    const handleCloseEditPopup = () => {
        setShowEditPopup(false);
        setSelectedCampaign(null);
    };

    const handleStatusChange = async (status) => {
        if (selectedCampaign) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found.');
                }
                await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/campaigns/${selectedCampaign._id}`, { status }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const updated = campaigns.map((c) =>
                    c._id === selectedCampaign._id ? { ...c, status } : c
                );
                setCampaigns(updated);
                toast.success(`Status updated to "${status}"`);
                handleCloseEditPopup();
            } catch (err) {
                toast.error(err.response?.data?.error || 'Failed to update campaign status.');
            }
        }
    };

    // open message popup
    const handleOpenMessagePopup = (campaign) => {
        setSelectedMessageCampaign(campaign);
        setShowMessagePopup(true);
    };

    const handleCloseMessagePopup = () => {
        setShowMessagePopup(false);
        setSelectedMessageCampaign(null);
    };

    // Open/Close Deduct Credit Popup
    const handleOpenDeductCreditPopup = (campaign) => {
        setSelectedCampaign(campaign);
        setShowDeductCreditPopup(true);
        setDeductAmount(""); // Reset amount when opening
    };

    const handleCloseDeductCreditPopup = () => {
        setShowDeductCreditPopup(false);
        setSelectedCampaign(null);
        setDeductAmount("");
    };

    const handleDeductCredits = async () => {
        if (selectedCampaign && deductAmount) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found.');
                }
                const promise = axios.get(`${import.meta.env.VITE_API_URL}/api/auth/a_campaigns`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                toast.promise(promise, {
                    loading: 'Fetching campaigns...',
                    success: 'Campaigns loaded!',
                    error: 'Failed to load campaigns.',
                });

                const response = await promise;
                // Add a 'withButton' property based on whether deductedCredits exist
                const campaignsWithButtonInfo = response.data.campaigns.map(campaign => ({
                    ...campaign,
                    withButton: campaign.deductedCredits > 0 // Assuming campaigns with deducted credits are "with button"
                }));
                setCampaigns(campaignsWithButtonInfo);
            } catch (err) {
                setError(err.message || 'Failed to fetch campaigns.');
            } finally {
                setLoading(false);
            }
        } // Closing brace for if (selectedCampaign && deductAmount)
    }; // Closing brace for handleDeductCredits

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDeletePopup && deletePopupRef.current && !deletePopupRef.current.contains(event.target)) {
                handleCloseDeletePopup();
            }
            if (showEditPopup && editPopupRef.current && !editPopupRef.current.contains(event.target)) {
                handleCloseEditPopup();
            }
            if (showMessagePopup && messagePopupRef.current && !messagePopupRef.current.contains(event.target)) {
                handleCloseMessagePopup();
            }
            if (showDeductCreditPopup && deductCreditPopupRef.current && !deductCreditPopupRef.current.contains(event.target)) {
                handleCloseDeductCreditPopup();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDeletePopup, showEditPopup, showMessagePopup, showDeductCreditPopup]);

    return (
        <div className="flex w-screen h-screen">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <Header />

                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-xl font-bold text-black">All Campaigns</h1>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-60 mb-3 ml-auto">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <CiSearch size={20} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search by any field..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-8 py-2 border border-gray-400 rounded-full text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 "
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

                    {/* Table */}
                    <div className="flex-1 overflow-auto bg-white rounded-lg ">
                        
                            <table className="w-full border-collapse text-sm border border-gray-300">
                                <thead>
                                    <tr className="bg-blue-500 text-white text-left text-sm">
                                        <th className="px-2 py-1 border border-gray-300">Sr.No</th>
                                        <th className="px-2 py-1 border border-gray-300">Name</th>
                                        <th className="px-2 py-1 border border-gray-300">Number</th>
                                        <th className="px-2 py-1 border border-gray-300">Date</th>
                                        <th className="px-2 py-1 border border-gray-300">Credit</th>
                                        <th className="px-2 py-1 border border-gray-300">Message</th>
                                        <th className="px-2 py-1 border border-gray-300 text-center">Status</th>
                                        <th className="px-2 py-1 border border-gray-300 text-center">Type</th>
                                        <th className="px-2 py-1 border border-gray-300 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCampaigns.length > 0 ? (
                                        filteredCampaigns.map((c, index) => {
                                            const option = statusOptions.find((o) => o.name === c.status);
                                            const statusClass = option ? option.color : "bg-gray-100 text-gray-600";
                                            return (
                                                <tr key={c._id} className="hover:bg-gray-100 text-black">
                                                    <td className="px-2 py-1 border border-gray-300">{index + 1}</td>
                                                    <td className="px-2 py-1 border border-gray-300">{c.campaignname}</td>
                                                    <td className="px-2 py-1 border border-gray-300">{c.mobienumbers}</td>
                                                    <td className="px-2 py-1 border border-gray-300">{new Date(c.startdate).toLocaleDateString()}</td>
                                                    <td className="px-2 py-1 border border-gray-300">{c.deductedCredits || 0}</td> {/* Display deducted credits */}
                                                    <td
                                                        className="px-2 py-1 border border-gray-300 cursor-pointer text-blue-600 hover:underline max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                                                        onClick={() => handleOpenMessagePopup(c)}
                                                        title="Click to view full message"
                                                        dangerouslySetInnerHTML={{ __html: c.message }}
                                                    >
                                                    </td>
                                                    <td className="px-2 py-1 border border-gray-300 text-center"
                                                        onClick={() => handleOpenEditPopup(c)} 
                                                    >
                                                        <span className={`px-2 py-[2px] text-xs rounded-full ${statusClass}`} 
                                                        >
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-1 border border-gray-300 text-center">
                                                        <span className={`px-2 py-[2px] text-xs rounded-full `}>
                                                            {c.campaign_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 py-1 border border-gray-300">
                                                        <div className="flex gap-1 justify-center text-base">
                                                            <button
                                                                onClick={() => handleOpenEditPopup(c)}
                                                                className="text-green-600 hover:text-green-800 border border-green-600 hover:border-green-800 px-1 py-0.5 rounded-full"
                                                            >
                                                                <CiEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenDeductCreditPopup(c)} // New button for deducting credits
                                                                className="text-blue-500 hover:text-blue-700 bg-white border border-blue-500 hover:border-blue-700 px-1 py-0.5 rounded-full"
                                                                title="Deduct Credits"
                                                            >
                                                                <CiImport />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenDeletePopup(c)}
                                                                className="text-red-600 hover:text-red-800 border border-red-600 hover:border-red-800 px-1 py-0.5 rounded-full"
                                                            >
                                                                <IoTrashOutline />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="12" className="text-center py-3 text-gray-500 border border-gray-300">
                                                No campaigns found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Popup */}
            {showDeletePopup && selectedCampaign && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={deletePopupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-96"
                    >
                        <button
                            onClick={handleCloseDeletePopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            Delete Campaign {selectedCampaign.name}?
                        </h2>
                        <p className="mb-4 text-gray-700">
                            Are you sure you want to delete this campaign? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCloseDeletePopup}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteCampaign}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Popup */}
            {showEditPopup && selectedCampaign && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={editPopupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-96"
                    >
                        <button
                            onClick={handleCloseEditPopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            Edit Status - {selectedCampaign.campaignname}
                        </h2>
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.name}
                                    onClick={() => handleStatusChange(option.name)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${option.color} hover:scale-105 transition`}
                                >
                                    {option.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Message Popup */}
            {showMessagePopup && selectedMessageCampaign && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={messagePopupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-[400px] max-w-full"
                    >
                        <button
                            onClick={handleCloseMessagePopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            {selectedMessageCampaign.campaignname} : Full Message
                        </h2>
                        <div
                            className="text-gray-700 whitespace-pre-wrap break-words"
                            dangerouslySetInnerHTML={{ __html: selectedMessageCampaign.message }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Deduct Credit Popup */}
            {showDeductCreditPopup && selectedCampaign && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
                    <div
                        ref={deductCreditPopupRef}
                        className="relative bg-white border border-gray-300 rounded-2xl shadow-2xl shadow-blue-300 p-6 w-96"
                    >
                        <button
                            onClick={handleCloseDeductCreditPopup}
                            className="absolute top-4 right-1 text-gray-500 hover:text-gray-700 bg-white"
                        >
                            <IoClose size={22} />
                        </button>

                        <h2 className="text-lg font-bold mb-4 text-black">
                            Deduct Credits for "{selectedCampaign.campaignname}"
                        </h2>
                        <p className="mb-4 text-gray-700">
                            Enter the amount of credits to deduct from the user who submitted this campaign.
                        </p>
                        <input
                            type="number"
                            value={deductAmount}
                            onChange={(e) => setDeductAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-black"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCloseDeductCreditPopup}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeductCredits}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Deduct Credits
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllCampaign;

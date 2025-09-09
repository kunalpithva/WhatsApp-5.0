// src/components/WithoutButton.js
import { useState,useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import RichTextEditorComponent from "../components/RichTextEditor";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const WithoutButton = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(true);
    const [campname, setCampname] = useState('');
    const [mobileNumbers, setMobileNumbers] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [excelFile, setExcelFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null); // State for one image
    const [uploadedVideo, setUploadedVideo] = useState(null); // State for one video

    const [openFileGuidelines, setOpenFileGuidelines] = useState(false);
    const [openUploadGuidelines, setOpenUploadGuidelines] = useState(false);
    const [typedNumbers, setTypedNumbers] = useState('');
    const [pastedNumbers, setPastedNumbers] = useState('');
    const [user, setUser] = useState(null); // State to store user data
    
        useEffect(() => {
            const fetchCredits = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/credits`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.error || "Failed to fetch credits");
                    }
                    setUser({ credit: data.credits }); // Only store credits
                } catch (error) {
                    toast.error(error.message);
                }
            };
            fetchCredits();
        }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleMobileNumbersChange = (e) => {
        const { value } = e.target;
        setMobileNumbers(value);
        setTypedNumbers(value); // Assuming all manual input is "typed" for simplicity
    };

    const handleMobileNumbersPaste = (e) => {
        const pastedText = e.clipboardData.getData('text');
        setPastedNumbers(pastedText);
        setMobileNumbers(pastedText); // Update mobileNumbers with pasted content
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        addFile(file, type);
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        addFile(file, type);
    };

    const addFile = (file, type) => {
        if (!file) return;
        if (type === 'csv' && file.name.endsWith('.csv')) {
            setCsvFile(file);
        } else if (type === 'excel' && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            setExcelFile(file);
        } else if (type === 'upload') {
            if (file.type.startsWith('image/') && !uploadedImage) {
                setUploadedImage(file);
            } else if (file.type.startsWith('video/') && !uploadedVideo) {
                setUploadedVideo(file);
            } else if (file.type.startsWith('image/') && uploadedImage) {
                toast.error("Only one image file is allowed.");
            } else if (file.type.startsWith('video/') && uploadedVideo) {
                toast.error("Only one video file is allowed.");
            } else {
                toast.error("Only one image and one video file are allowed for general uploads.");
            }
        }
    };

    const removeFile = (type, fileType = null) => {
        if (type === 'csv') setCsvFile(null);
        else if (type === 'excel') setExcelFile(null);
        else if (type === 'upload') {
            if (fileType === 'image') setUploadedImage(null);
            else if (fileType === 'video') setUploadedVideo(null);
        }
    };

    const handleSubmit = async () => {
        
        const formData = new FormData();
        formData.append("campaignname", campname);
        formData.append("mobienumbers", mobileNumbers);
        formData.append("message", message);

        if (csvFile) {
            formData.append("files", csvFile);
        }
        if (excelFile) {
            formData.append("files", excelFile);
        }
        if (uploadedImage) {
            formData.append("files", uploadedImage);
        }
        if (uploadedVideo) {
            formData.append("files", uploadedVideo);
        }

        if(!message){
            toast.error("Message content cannot be empty.");
            return;
        }
        if(!campname){
            toast.error("Campaign name cannot be empty.");
            return;
        }
        if(!mobileNumbers && !csvFile && !excelFile && !uploadedImage && !uploadedVideo){
            toast.error("Please provide mobile numbers or upload at least one file (CSV, Excel, Image, or Video).");
            return;
        }

        const campaignPromise = new Promise(async (resolve, reject) => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/createcampaign_withoutbutton`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const data = await response.json();

                if (!response.ok) {
                    reject(new Error(data.error || "Something went wrong"));
                    return;
                }

                // Log suspicious activity
                if (typedNumbers || pastedNumbers) {
                    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/suspiciousactivity`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            campaignname: campname,
                            mobile_number: user ? user.mobile_number : '',
                            typed_numbers: typedNumbers,
                            pasted_numbers: pastedNumbers,
                        }),
                    });
                }
                resolve("Campaign created successfully!");
            } catch (error) {
                reject(error);
            }
        });

        toast.promise(campaignPromise, {
            loading: "Creating campaign...",
            success: (message) => message,
            error: (err) => err.message,
        });
    };

    return (
        <div className="flex w-screen h-screen font-sans bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <div className="flex justify-between items-center py-8 px-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Send Without Button WhatsApp Message
                    </h2>
                    {user && (
                        <div className="text-lg font-semibold text-gray-800 bg-amber-200 px-4 py-2 rounded-full">
                            Credits: {user.credit}
                        </div>
                    )}
                </div>
                <main className="p-8 flex-1 overflow-y-auto py-1">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <div className="flex items-center mb-6">
                            <input
                                type="text"
                                placeholder="Campaign name"
                                value={campname}
                                onChange={(e) => setCampname(e.target.value)}
                                className="flex-1 max-w-xs p-2 h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                            <button
                                onClick={handleSubmit}
                                className="px-6 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-150 ease-in-out font-medium flex items-center ml-auto"
                            >
                                Submit
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Mobile Numbers</h3>
                                    <textarea
                                        placeholder="Enter mobile number"
                                        value={mobileNumbers}
                                        onChange={handleMobileNumbersChange}
                                        onPaste={handleMobileNumbersPaste}
                                        className="w-full p-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* CSV Dropzone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'csv')}
                                        className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg relative hover:bg-gray-50 transition duration-150"
                                    >
                                        <p className="font-semibold text-gray-700 mb-2">CSV Files</p>
                                        <p className="text-sm text-gray-500 mb-4">Drop your CSV file here</p>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(e, 'csv')}
                                            accept=".csv"
                                            className="hidden"
                                            id="csv-upload"
                                        />
                                        <button
                                            onClick={() => document.getElementById('csv-upload').click()}
                                            className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-200 shadow-md"
                                        >
                                            Browse Files
                                        </button>
                                        {csvFile && (
                                            <div className="mt-2 flex justify-center items-center text-green-600 space-x-2">
                                                <span>{csvFile.name}</span>
                                                <button
                                                    onClick={() => removeFile('csv')}
                                                    className="text-red-600 hover:text-red-800 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Excel Dropzone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'excel')}
                                        className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg relative hover:bg-gray-50 transition duration-150"
                                    >
                                        <p className="font-semibold text-gray-700 mb-2">EXCEL Files</p>
                                        <p className="text-sm text-gray-500 mb-4">Drop your Excel file here</p>
                                        <input
                                            type="file"
                                            onChange={(e) => handleFileChange(e, 'excel')}
                                            accept=".xlsx, .xls"
                                            className="hidden"
                                            id="excel-upload"
                                        />
                                        <button
                                            onClick={() => document.getElementById('excel-upload').click()}
                                            className="px-4 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700 transition duration-200 shadow-md"
                                        >
                                            Browse Files
                                        </button>
                                        {excelFile && (
                                            <div className="mt-2 flex justify-center items-center text-green-600 space-x-2">
                                                <span>{excelFile.name}</span>
                                                <button
                                                    onClick={() => removeFile('excel')}
                                                    className="text-red-600 hover:text-red-800 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* File Format Guidelines Dropdown */}
                                <div>
                                    <div
                                        onClick={() => setOpenFileGuidelines(!openFileGuidelines)}
                                        className="bg-gray-100 p-4 rounded-md cursor-pointer select-none"
                                    >
                                        <div className="flex justify-between items-center font-semibold text-gray-700">
                                            FILE FORMAT GUIDELINES
                                            <span className={`text-sm transform transition-transform duration-300 ${openFileGuidelines ? "rotate-180" : ""}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out transform ${openFileGuidelines ? "max-h-96 opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-95"} origin-top`}
                                    >
                                        <ul className="space-y-2 text-sm text-gray-600 mt-4 p-2">
                                            <li className="font-semibold">CSV File Requirements</li>
                                            <ul className="ml-6 space-y-1 list-disc">
                                                <li>First row should contain column headers</li>
                                                <li>Use commas to separate values</li>
                                                <li>Enclose text with commas in quotes</li>
                                                <li>Maximum file size: 10MB</li>
                                            </ul>
                                            <li className="font-semibold mt-4">Excel File Requirements</li>
                                            <ul className="ml-6 space-y-1 list-disc">
                                                <li>Supports .xlsx and .xls formats</li>
                                                <li>Multiple sheets supported</li>
                                                <li>First row should contain headers</li>
                                                <li>Maximum file size: 25MB</li>
                                            </ul>
                                        </ul>
                                    </div>
                                </div>

                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div className="h-64 pb-10">
                                    <RichTextEditorComponent
                                        value={message}
                                        onChange={(value) => setMessage(value)}
                                    />
                                </div>

                                {/* Upload Guidelines Dropdown */}
                                <div>
                                    <div
                                        onClick={() => setOpenUploadGuidelines(!openUploadGuidelines)}
                                        className="bg-gray-100 p-4 rounded-md cursor-pointer select-none"
                                    >
                                        <div className="flex justify-between items-center font-semibold text-gray-700">
                                            UPLOAD GUIDELINES
                                            <span className={`text-sm transform transition-transform duration-300 ${openUploadGuidelines ? "rotate-180" : ""}`}>
                                                ▼
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className={`overflow-hidden transition-all duration-500 ease-in-out transform ${openUploadGuidelines ? "max-h-96 opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-95"
                                            } origin-top`}
                                    >
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-4 p-2">
                                            <div>
                                                <h4 className="font-bold">IMAGES</h4>
                                                <ul className="mt-1 space-y-1">
                                                    <li>Maximum: 1 image</li>
                                                    <li>Size limit: 1MB</li>
                                                    <li>Current: {uploadedImage ? '1' : '0'}/1</li>
                                                    <li><span className="text-gray-400">Supported: JPG, PNG, GIF, WebP, SVG</span></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-bold">VIDEO</h4>
                                                <ul className="mt-1 space-y-1">
                                                    <li>Maximum: 1 video</li>
                                                    <li>Size limit: 16MB</li>
                                                    <li>Current: {uploadedVideo ? '1' : '0'}/1</li>
                                                    <li><span className="text-gray-400">Supported: MP4, AVI, MOV, WebM</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload Dropzone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, 'upload')}
                                    className="border-2 border-dashed border-gray-300 p-6 text-center rounded-lg relative hover:bg-gray-50 transition duration-150"
                                >
                                    <div className="flex justify-center mb-2 space-x-4 text-xs text-gray-400">
                                        <span>Image: {uploadedImage ? '1' : '0'}/1</span>
                                        <span>Video: {uploadedVideo ? '1' : '0'}/1</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">Drop your image or video files here or click to browse</p>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e, 'upload')}
                                        accept="image/*,video/*"
                                        className="hidden"
                                        id="file-upload"
                                        multiple
                                    />
                                    <button
                                        onClick={() => document.getElementById('file-upload').click()}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out font-medium"
                                    >
                                        Choose Files
                                    </button>

                                    {(uploadedImage || uploadedVideo) && (
                                        <ul className="mt-4 text-sm text-left">
                                            {uploadedImage && (
                                                <li
                                                    key="uploaded-image"
                                                    className="text-green-600 flex justify-between items-center group hover:bg-gray-100 p-1 rounded-md"
                                                >
                                                    {uploadedImage.name}
                                                    <button
                                                        onClick={() => removeFile('upload', 'image')}
                                                        className="text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2"
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            )}
                                            {uploadedVideo && (
                                                <li
                                                    key="uploaded-video"
                                                    className="text-green-600 flex justify-between items-center group hover:bg-gray-100 p-1 rounded-md"
                                                >
                                                    {uploadedVideo.name}
                                                    <button
                                                        onClick={() => removeFile('upload', 'video')}
                                                        className="text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2"
                                                    >
                                                        ×
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WithoutButton;

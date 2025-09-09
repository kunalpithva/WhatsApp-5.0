import React from 'react';

const Header = () => {
    return (
        <header className="flex justify-end items-center bg-white px-8 py-4 border-b border-gray-300">
            <div className="flex items-center gap-3">
                <span className="font-semibold text-lg text-black">Yash</span>
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-black">👤</span>
                </div>
            </div>
        </header>
    );
};

export default Header;

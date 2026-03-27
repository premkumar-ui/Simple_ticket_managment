import { Link, NavLink } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Edit, User } from "lucide-react";
import API from "../api/axios";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    const [menuOpen, setMenuOpen] = useState(false);
    const [profileBar, setProfileBar] = useState(false);
    const [profileEdit, setProfileEdit] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const [name, setName] = useState("");
    const [file, setFile] = useState(null);

    // 🔥 Fetch profile
    useEffect(() => {
        if (user) {
            API.get("/auth/me")
                .then((res) => {
                    setProfileData(res.data);
                    setName(res.data.name);
                })
                .catch(() => logout());
        }
    }, [user]);
    // useEffect(()=>{setProfileEdit(false)},[profileBar])
    const navLinkStyle =
        "text-gray-600 hover:text-indigo-600 transition font-semibold";

    return (
        <>
            <nav className="w-full sticky top-0 z-50 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 min-h-[3.7rem] flex items-center justify-between">

                    {/* LEFT */}
                    <div className="flex items-center gap-10">
                        <Link className="text-lg font-bold text-gray-800">
                            Ticket Management
                        </Link>

                        <div className="hidden md:flex items-center gap-6 text-sm">
                            {/* <NavLink to="/dashboard" className={navLinkStyle}>
                                Home
                            </NavLink> */}
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4">

                        {!user && (
                            <>
                                <Link to="/" className="text-gray-600 text-sm hover:text-indigo-600">
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {user && (
                            profileData?.profile_image ? <img className="w-9 h-9 rounded-full flex items-center justify-center"
                                onClick={() => setProfileBar(true)} src={`http://127.0.0.1:8000${profileData.profile_image}`}></img> :
                                <button
                                    onClick={() => setProfileBar(true)}
                                    className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center"
                                >
                                    <User />
                                </button>
                        )}

                        {/* Mobile */}
                        <button
                            className="md:hidden text-gray-700"
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            ☰
                        </button>
                    </div>
                </div>

                {/* MOBILE MENU */}
                {menuOpen && (
                    <div className="md:hidden border-t px-6 py-4 space-y-3">
                        <NavLink to="/dashboard" className={navLinkStyle}>
                            Home
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* 🔥 PROFILE DRAWER */}
            {profileBar && (
                <>
                    {/* BLUR BACKGROUND */}
                    <div
                        onClick={() => setProfileBar(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 mt-15"
                    />

                    {/* RIGHT PANEL */}
                    <div className="fixed top-0 right-0 h-full w-[280px] bg-white z-50 shadow-xl p-5 flex flex-col text-gray-800">

                        {/* Header */}
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="font-semibold">Profile</h2>
                            <button className="font-medium text-sm bg-gray-300 px-1 rounded cursor-pointer" onClick={() => setProfileBar(false)}>✕</button>
                        </div>
                        <div className="flex justify-end mt-1">
                            <button onClick={() => setProfileEdit(true)} className="text-sm font-medium py-0.5 px-2 rounded bg-indigo-200 hover:bg-indigo-300 flex gap-1 justify-center items-center"><Edit size={15}/> Edit</button>
                        </div>
                        {/* Image */}
                        <div className="flex justify-center mt-4">
                            {profileData?.profile_image ? (
                                <img
                                    src={`http://127.0.0.1:8000${profileData?.profile_image}`}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                                    <User size={20} />
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <p className="text-center text-sm text-gray-500 mt-2">
                            {profileData?.name}
                        </p>
                        <p className="text-center text-sm text-gray-500 mt-1">
                            {profileData?.email}
                        </p>
                        {profileEdit && (
                            <div className="mt-5 border-t pt-1 border-gray-400">
                                {/* Name Edit */}
                                <div className="flex justify-between">
                                <p className="font-medium text-sm">Edit profile</p>
                                <button onClick={()=>setProfileEdit(false)} className="font-medium text-sm bg-gray-300 px-1 rounded cursor-pointer">✕</button>
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-2 border rounded px-2 py-1 text-sm"
                                />

                                {/* File Upload */}
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="mt-3 text-sm"
                                />

                                {/* Save */}
                                <button
                                    onClick={async () => {
                                        const formData = new FormData();
                                        formData.append("name", name);
                                        if (file) formData.append("file", file);

                                        const res = await API.put("/auth/me", formData, {
                                            headers: {
                                                "Content-Type": "multipart/form-data",
                                            },
                                        });

                                        setProfileData(res.data.user);
                                        setProfileBar(false);
                                    }}
                                    className="mt-4 px-3 !py-0.5 bg-indigo-600 text-white py-1.5 rounded !text-sm hover:bg-indigo-700"
                                >
                                    Save
                                </button>
                            </div>
                        )}

                        {/* Logout */}
                        <button
                            onClick={()=>{
                                setProfileBar(false);
                                logout()}}
                            className="mt-auto text-red-500 text-sm font-medium py-2 rounded cursor-pointer hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

export default Navbar;
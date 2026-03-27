import React, { useEffect, useState } from 'react'
import API from '../api/axios';
import { FaFire, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

export const AssignUser = () => {
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("All");
    const [priority, setPriority] = useState("All");

    const fetchTickets = async () => {
        try {
            setLoading(true);

            const res = await API.get("/tickets/assigned/my");

            setTickets(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchTickets();
    }, []);

    const statusTabs = ["All", "open", "in_progress", "closed"];
    const priorityTabs = ["All", "High", "Medium", "Low"];

    const SkeletonCard = () => (
        <div className="bg-white shadow-md rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
        </div>
    );

    const EmptyState = () => (
        <div className="col-span-full text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700">
                No matching tickets
            </h3>
            <p className="text-gray-500 mt-2">
                Try adjusting your filters
            </p>
        </div>
    );
    useEffect(() => {
        let temp = [...tickets];

        if (status !== "All") {
            temp = temp.filter((t) => t.status === status);
        }

        if (priority !== "All") {
            temp = temp.filter((t) => t.priority === priority);
        }

        setFilteredTickets(temp);
    }, [tickets, status, priority]);

    return (
        <div className="px-4 py-1 text-gray-800">
            <h2 className="text-xl font-bold mb-2">Assigned Tickets</h2>
            <div className="flex gap-5">
                {/* 🔥 Status Tabs */}
                <div className="">
                    <p className="text-sm font-bold text-gray-800 mb-0.5">Status</p>
                    <div className="flex gap-2 mb-3 flex-wrap">
                        {statusTabs.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`px-2 pb-1 pt-0.5 rounded-full text-xs ${status === s
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {s === "in_progress" ? "In Progress" : s}
                            </button>
                        ))}
                    </div>
                </div>
                {/* 🔥 Priority Tabs */}
                <div className="">
                    <p className="text-sm font-bold text-gray-800 mb-0.5">Priority</p>
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {priorityTabs.map((p) => (
                            <button
                                key={p}
                                onClick={() => setPriority(p)}
                                className={`px-2 pb-1 pt-0.5 rounded-full text-xs ${priority === p
                                    ? "bg-indigo-400 text-white"
                                    : "bg-white border text-gray-600 hover:bg-gray-100"
                                    }`}
                            >

                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                ) : filteredTickets.length === 0 ? (
                    <EmptyState />
                ) : (
                    filteredTickets.map((t) => {
                        const priorityColor =
                            t.priority === "High"
                                ? "border-red-500"
                                : t.priority === "Medium"
                                    ? "border-yellow-500"
                                    : "border-green-500";

                        return (
                            <div
                                key={t.id}
                                className={`bg-white shadow-md rounded-xl p-4 border-l-4 ${priorityColor} hover:shadow-lg transition`}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">{t.title}</h3>

                                    <span
                                        className={`text-xs px-2 pb-1 pt-0.5 rounded-full ${t.status === "open"
                                            ? "bg-blue-100 text-blue-600"
                                            : t.status === "in_progress"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-green-100 text-green-600"
                                            }`}
                                    >
                                        {t.status}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {t.description}
                                </p>

                                <div className="mt-4 text-sm">
                                    <span className="text-gray-500 flex gap-2">
                                        Priority:{" "}
                                        <span
                                            className={`flex items-center gap-1 text-xs px-2 pb-1 pt-0.5 font-medium rounded-full ${t.priority === "High"
                                                ? "bg-red-100 text-red-700"
                                                : t.priority === "Medium"
                                                    ? "bg-yellow-100 text-yellow-600"
                                                    : "bg-green-100 text-green-600"
                                                }`}
                                        >
                                            {t.priority === "High" && <FaFire className="text-red-600" />}
                                            {t.priority === "Medium" && <FaExclamationCircle className="text-yellow-500" />}
                                            {t.priority === "Low" && <FaExclamationCircle className="text-green-600" />}

                                            {t.priority}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    )
}

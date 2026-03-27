import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

const TicketDetail = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        API.get(`/tickets/${id}`)
            .then(res => setTicket(res.data))
            .catch(err => console.log(err));
    }, [id]);

    if (!ticket) return <p className="p-6">Loading...</p>;

    const statusColor = {
        open: "bg-green-100 text-green-600",
        closed: "bg-red-100 text-red-600",
        in_progress: "bg-yellow-100 text-yellow-600"
    };

    const priorityColor = {
        High: "bg-red-100 text-red-600",
        Medium: "bg-yellow-100 text-yellow-600",
        Low: "bg-green-100 text-green-600"
    };

    return (
        <div className="max-w-5xl mx-auto mt-1 px-5">

            {/* HEADER */}
            <div className="bg-white rounded-xl shadow p-6 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    {ticket.title}
                </h1>

                <div className="flex gap-3 mt-3">
                    <p className="text-sm ">Status : <span className={`px-3 pb-1 pt-0.5 text-xs  font-medium rounded-full ${statusColor[ticket.status]}`}>
                        {ticket.status}
                    </span>
                    </p>

                    <p className="text-sm">Priority : <span className={`px-3 pb-1 pt-0.5 text-xs font-medium rounded-full ${priorityColor[ticket.priority]}`}>
                        {ticket.priority}
                    </span></p>

                </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white rounded-xl shadow p-6 mb-4">
                <h2 className="font-semibold text-gray-700 mb-2">Description</h2>
                <p className="text-gray-600">{ticket.description}</p>
            </div>

            {/* DETAILS GRID */}
            <div className="grid md:grid-cols-2 gap-4">

                {/* CREATOR */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="font-semibold text-gray-700 mb-3">Created By</h2>

                    {ticket.user ? (
                        <div>
                            <p className="font-medium">{ticket.user.name}</p>
                            <p className="text-sm text-gray-500">{ticket.user.email}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">No data</p>
                    )}
                </div>

                {/* ASSIGNED USER */}
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="font-semibold text-gray-700 mb-3">Assigned To</h2>

                    {ticket.assigned_user ? (
                        <div>
                            <p className="font-medium">{ticket.assigned_user.name}</p>
                            <p className="text-sm text-gray-500">{ticket.assigned_user.email}</p>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">Not assigned</p>
                    )}
                </div>

                {/* META */}
                <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
                    <h2 className="font-semibold text-gray-700 mb-3">Details</h2>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <p>
                            <span className="text-gray-500">Ticket ID:</span> {ticket.id}
                        </p>

                        <p>
                            <span className="text-gray-500">Created At:</span>{" "}
                            {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                    Update Status
                </button>

                {/* <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    Assign User
                </button> */}
            </div>
        </div>
    );
};

export default TicketDetail;
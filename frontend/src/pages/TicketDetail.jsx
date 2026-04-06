import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { User } from "lucide-react";

const TicketDetail = () => {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useContext(AuthContext)
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchComments = () => {
        API.get(`/comments/${id}`)
            .then(res => setComments(res.data))
            .catch(err => console.log(err));
    };
    useEffect(() => {
        API.get(`/tickets/${id}`)
            .then(res => { setTicket(res.data); setSelectedTicket(res.data) })
            .catch(err => console.log(err));
        fetchComments();
    }, [id]);

    const handleUpdate = async () => {
        if (!window.confirm("Sure you need to change the status?")) return;
        const status = selectedTicket.status
        const priority = selectedTicket.priority
        try {
            await API.put(`/tickets/sp/${selectedTicket.id}/`, { status, priority });
            fetchTickets();
            setIsModalOpen(false)
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            await API.post(`/comments/${id}`, {
                content: newComment
            });
            setNewComment("");
            fetchComments();
        } catch (err) {
            console.error(err);
        }
    };

    // 🔥 DELETE COMMENT
    const handleDeleteComment = async (commentId) => {
        try {
            await API.delete(`/comments/${commentId}`);
            fetchComments();
        } catch (err) {
            console.error(err);
        }
    };

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

                        <p className="text-sm">
                            <span className="text-gray-500">Created At:</span>{" "}
                            {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 mt-6">
                <h2 className="font-semibold mb-4">Comments</h2>

                {/* Add Comment */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 border px-3 py-2 rounded text-sm"
                    />
                    <button
                        onClick={handleAddComment}
                        className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
                    >
                        Post
                    </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {comments.length === 0 && (
                        <p className="text-gray-400 text-sm">No comments yet</p>
                    )}

                    {comments.map((c) => (
                        <div
                            key={c.id}
                            className="border p-2 rounded-lg flex justify-between items-start"
                        >
                            <div className="flex justify-center items-center gap-2 ">
                                <div className="flex justify-center items-center gap-2 ">
                                    {c?.user.profile_image ? (
                                        <img
                                            src={`http://127.0.0.1:8000${c?.user?.profile_image}`}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                            <User size={20} />
                                        </div>
                                    )}
                                </div>
                                <div className="">
                                    <p className="text-sm font-medium mb-0 text-gray-800">
                                        {c.user?.name} <span className="text-[10px] ml-2 text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm ml-1 text-gray-600">
                                        {c.content}
                                    </p>
                                </div>
                            </div>

                            {/* Delete button (only own comment) */}
                            {c.user?.id === user.id && (
                                <button
                                    onClick={() => handleDeleteComment(c.id)}
                                    className="text-xs text-red-500"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* ACTIONS */}
            {user.role === "ADMIN" && (
                <div className="mt-4 flex gap-3">
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        Update Status
                    </button>

                    <button onClick={() => setAssignModalOpen(true)} className="px-4 py-2 text-sm text-white bg-blue-400 rounded hover:bg-blue-600">
                        Assign User
                    </button>
                </div>
            )}
            {assignModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 text-gray-800">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-xl animate-scaleIn">
                        <h2 className="text-lg font-semibold mb-4">Assign Ticket</h2>

                        {/* Status */}
                        <label className="">Assign To</label>
                        <select
                            value={selectedTicket.assigned_to || ""}
                            onChange={(e) =>
                                setSelectedTicket({
                                    ...selectedTicket,
                                    assigned_to: Number(e.target.value),
                                })
                            }
                            className="w-full border px-2 py-1 text-sm rounded mb-3"
                        >
                            <option value="">Unassigned</option>
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setAssignModalOpen(false)}
                                className="px-3 py-1 text-xs bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAssign}
                                className="px-3 py-1 bg-blue-600 text-xs text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 text-gray-800">
                    <div className="bg-white rounded-xl p-6 w-80 shadow-xl animate-scaleIn">
                        <h2 className="text-lg font-semibold mb-4">Edit Ticket</h2>

                        {/* Status */}
                        <label>Status</label>
                        <select
                            value={selectedTicket.status}
                            onChange={(e) =>
                                setSelectedTicket({
                                    ...selectedTicket,
                                    status: e.target.value,
                                })
                            }
                            className="w-full border px-2 py-1 text-sm rounded mb-3"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>

                        {/* Priority */}
                        <label>Priority</label>
                        <select
                            value={selectedTicket.priority}
                            onChange={(e) =>
                                setSelectedTicket({
                                    ...selectedTicket,
                                    priority: e.target.value,
                                })
                            }
                            className="w-full border px-2 py-1 text-sm rounded mb-4"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-3 py-1 text-xs bg-gray-300 rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleUpdate}
                                className="px-3 py-1 bg-blue-600 text-xs text-white rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketDetail;
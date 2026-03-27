import { useEffect, useState } from "react";
import API from "../api/axios";

const AdminUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleActive = async (id) => {
    try {
      const res = await API.put(`/auth/users/${id}/toggle-active`);

      // 🔥 instant UI update (don’t refetch like a beginner)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_active: res.data.is_active } : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-4 py-1 bg-gray-100 ">
      <h2 className="text-2xl font-bold mb-5">User Management</h2>

      <div className="overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-200 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  {/* User */}
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img
                      src={
                        u.profile_image ?`http://127.0.0.1:8000${u.profile_image}`:
                        "https://ui-avatars.com/api/?name=" + u.name
                      }
                      alt="profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium">{u.name}</span>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-600">
                      {u.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        u.is_active
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(u.id)}
                      className={`px-3 py-1 text-xs rounded font-medium ${
                        u.is_active
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUser;
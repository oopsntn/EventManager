import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Shield } from "lucide-react";
import axios from "axios";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:9999/admin/getUserById/${id}`);
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Cannot fetch user");
        } else {
          setUser(data.User);
          setSelectedRole(data.User.role || "user");
        }
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    };
    fetchUser();
  }, [id]);

  const handleEditClick = async () => {
    if (!user) return;
    if (user.role === selectedRole) {
      alert("Role chưa thay đổi");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `http://localhost:9999/admin/changeRole/${id}`,
        { role: selectedRole }
      );
      setUser(res.data.user);
      alert("Role changed successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error changing role");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div
      className="d-flex justify-content-center align-items-start"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fef6",
        paddingTop: "50px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        {/* Back button bên trái */}
        <button
          className="btn btn-link mb-3"
          onClick={() => navigate("/acc-manage")}
        >
          &larr; Back
        </button>

        {/* Card hiển thị thông tin */}
        <div
          className="card p-5 shadow"
          style={{ width: "100%", borderRadius: "12px" }}
        >
          <div className="text-center mb-4">
            <div
              className="rounded-circle bg-secondary d-flex justify-content-center align-items-center"
              style={{
                width: "100px",
                height: "100px",
                fontSize: "36px",
                color: "white",
                margin: "0 auto",
              }}
            >
              {user.name[0].toUpperCase()}
            </div>
            <h4 className="mt-3 mb-1">Profile</h4>
          </div>

          <div className="d-flex flex-column gap-3">
            {/* Name */}
            <div className="d-flex align-items-center gap-2">
              <User size={20} />
              <div style={{ flex: 1 }}>
                <small className="text-muted">Name</small>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={user.name}
                  disabled
                />
              </div>
            </div>

            {/* Email */}
            <div className="d-flex align-items-center gap-2">
              <Mail size={20} />
              <div style={{ flex: 1 }}>
                <small className="text-muted">Email</small>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={user.email}
                  disabled
                />
              </div>
            </div>

            {/* Phone */}
            <div className="d-flex align-items-center gap-2">
              <Phone size={20} />
              <div style={{ flex: 1 }}>
                <small className="text-muted">Phone number</small>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={user.phone || "Null"}
                  disabled
                />
              </div>
            </div>

            {/* Role */}
            <div className="d-flex align-items-center gap-2">
              <Shield size={20} />
              <div style={{ flex: 1 }}>
                <small className="text-muted">Role</small>
                <select
                  className="form-select form-select-sm"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="user">User</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleEditClick}
                disabled={loading}
              >
                {loading ? "Updating..." : "Edit"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/acc-manage")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;

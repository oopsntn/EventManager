import React, { useEffect, useState } from "react";
import { Pencil, Trash, Users, BarChart3 } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState("name");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:9999/admin/getAllUser")
      .then((res) => res.json())
      .then((data) => setUsers(data.users))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  const menuItems = [
    { title: "Account Management", url: "/acc-manage", icon: Users },
    { title: "Dashboard", url: "/statistics", icon: BarChart3 },
  ];

  // Lọc danh sách theo searchTerm và searchColumn
  const filteredUsers = users.filter((user) => {
    const value = user[searchColumn] || "";
    return value.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này không?")) return;

    try {
      const res = await fetch(`http://localhost:9999/admin/deleteUser/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message); // hiện thông báo thành công
        // Cập nhật danh sách users trên frontend
        setUsers((prev) => prev.filter((user) => user._id !== id));
      } else {
        alert(data.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi xóa user");
    }
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <div className="bg-white border-end" style={{ width: "250px" }}>
        <div className="p-4 border-bottom">
          <h4 className="fw-bold">Admin</h4>
        </div>
        <nav className="nav flex-column p-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className="nav-link d-flex align-items-center mb-2"
              activeClassName="active text-white bg-primary rounded"
            >
              <item.icon className="me-2" />
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header */}
        <header className="d-flex align-items-center justify-content-between bg-white p-3 border-bottom">
          <h5 className="mb-0">Account Management</h5>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/create-user")}
          >
            Create
          </button>
        </header>

        {/* Content */}
        <main className="p-4 flex-grow-1">
          {/*Search */}
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User Table */}
          <div className="card shadow-sm">
            <div className="card-body table-responsive">
              <table className="table table-bordered table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>STT</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user._id || index}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/user/${user._id}`)}
                    >
                      <td>{index + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.role}</td>

                      <td>
                        <button className="btn btn-sm btn-primary me-2">
                          <Pencil size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user._id);
                          }}
                        >
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

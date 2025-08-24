import React, { useEffect, useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user } = useAuth(); // lấy user từ context
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

    // Lấy thông tin user từ backend khi user có giá trị
  useEffect(() => {
    if (!user) return; // nếu chưa login thì không fetch

    const fetchProfile = async () => {
      try {
        // Lấy userId từ context
        const userId = user.id; // hoặc user._id nếu backend trả về _id
        const res = await axios.get(`http://localhost:9999/api/users/${userId}`);
        setProfile(res.data); // gán dữ liệu từ backend
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [user]);


const handleUpdate = async (e) => {
  e.preventDefault();
  if (!profile) return;

  // Validation
  if (!profile.name.trim()) {
    setMessage("Họ tên không được để trống");
    return;
  }

  if (!profile.phone.trim()) {
    setMessage("Số điện thoại không được để trống");
    return;
  }

  // Regex kiểm tra số điện thoại Việt Nam (10-11 số, bắt đầu 0)
  const phoneRegex = /^0\d{9,10}$/;
  if (!phoneRegex.test(profile.phone)) {
    setMessage("Số điện thoại không hợp lệ");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("phone", profile.phone);
    if (profile.avatarFile) formData.append("avatar", profile.avatarFile);

    const res = await axios.put(
      `http://localhost:9999/api/users/${user.id}/profile`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setMessage(res.data.message);
    setProfile(res.data.user);
  } catch (err) {
    console.error(err);
    setMessage("Lỗi khi cập nhật hồ sơ");
  }
};


  if (!profile) return <p>Đang tải thông tin...</p>; // tránh undefined

  return (
    <div className="container mt-4 d-flex flex-column align-items-center">
  <Card style={{ width: "400px" }}>
    <Card.Body>
      <Card.Title className="text-center">Thông tin cá nhân</Card.Title>

      {/* Avatar ra đầu và giữa */}
      {profile.avatar && (
        <div className="d-flex justify-content-center mb-3">
            <img
          src={profile.avatar.startsWith("http")
            ? profile.avatar
            : `http://localhost:9999${profile.avatar}`}
          alt="avatar"
          width={120}
          height={120}
          style={{ borderRadius: "50%" }}
        />

        </div>
      )}


      <Form onSubmit={handleUpdate}>
        <Form.Group className="mb-3 text-center">
          <Form.Label>Avatar</Form.Label>
         <Form.Control
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setProfile({ ...profile, avatarFile: file });
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Họ tên</Form.Label>
          <Form.Control
            type="text"
            value={profile.name || ""}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={profile.email || ""} disabled />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control
            type="text"
            value={profile.phone || ""}
            onChange={(e) =>
              setProfile({ ...profile, phone: e.target.value })
            }
          />
        </Form.Group>

        <Button type="submit" className="w-100">Cập nhật</Button>
      </Form>
      {message && <p className="mt-3 text-center">{message}</p>}
    </Card.Body>
  </Card>
</div>

  );
}

export default Profile;

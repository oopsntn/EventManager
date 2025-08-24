// middleware/auth.js
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY; 

// Middleware xác thực token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = user; // Lưu payload vào request
    next();
  });
}

function checkRole(roles) {
  return (req, res, next) => {
    // Kiểm tra xác thực
    if (!req.user) {
      return res.status(401).json({ 
        message: "Chưa xác thực", 
        error: "Vui lòng đăng nhập" 
      });
    }

    // Kiểm tra quyền
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Từ chối truy cập", 
        error: "Không đủ quyền",
        requiredRoles: roles,
        currentRole: req.user.role
      });
    }

    next();
  };
}

module.exports = { authenticateToken, SECRET_KEY, checkRole };

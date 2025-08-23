import "./App.css";
import Login from "./components/auth/Login";
import { Route, Routes } from "react-router-dom";
import Home from "./components/pages/Home";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import AdminDashboard from "./components/pages/admin/Management";
import CreateUserForm from "./components/pages/admin/CreateAccount";
import UserDetail from "./components/pages/admin/UserDetail";
import Statistics from "./components/pages/admin/Dashboard";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/acc-manage" element={<AdminDashboard />} />
        <Route path="/create-user" element={<CreateUserForm />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/statistics" element={<Statistics />} />

      </Routes>
      <Footer />
    </div>
  );
}

export default App;

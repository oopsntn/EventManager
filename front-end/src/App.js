import './App.css';
import Login from './components/auth/Login';
import { Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './context/PrivateRoute';
import AdminDashboard from './components/pages/admin/Management';
import CreateUserForm from './components/pages/admin/CreateAccount';
import UserDetail from './components/pages/admin/UserDetail';
import Register from './components/auth/Register';
import AdminNotificationPanel from './components/AdminNotificationPanel';
import Registration from "./components/pages/Registration";
import EventDetailUser from './components/pages/EventDetailUser';
import Profile from './components/pages/Profile';   
import EventList from './components/pages/EventList';
import EventDetail from './components/pages/EventDetail';
import RegistrationList from './components/pages/RegistrationList';
import Statistics from "./components/pages/admin/Dashboard";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/registrations" element={<Registration />} />
        <Route path="/events/:id" element={<EventDetailUser/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/acc-manage" element={<AdminDashboard />} />
        <Route path="/create-user" element={<CreateUserForm />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/my-events" element={<EventList />} />
        <Route path="/admin/acc-manage" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }/>
        <Route path="/admin/notifications" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminNotificationPanel />
          </PrivateRoute>
        } />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/event/:id/registrations" element={<RegistrationList />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

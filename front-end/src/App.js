import './App.css';
import Login from './components/auth/Login';
import { Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
<<<<<<< Updated upstream

=======
import PrivateRoute from './context/PrivateRoute';
import AdminDashboard from './components/pages/admin/Management';
import CreateUserForm from './components/pages/admin/CreateAccount';
import UserDetail from './components/pages/admin/UserDetail';
import Register from './components/auth/Register';
import AdminNotificationPanel from './components/AdminNotificationPanel';
import Registration from "./components/pages/Registration";
import EventDetailUser from './components/pages/EventDetailUser';
import Profile from './components/pages/Profile';   
>>>>>>> Stashed changes
function App() {
  return (
    <div>
      <Header/>
      <Routes>
<<<<<<< Updated upstream
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
    <Footer/>
=======
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
        <Route path="/registrations" element={<Registration />} />
        <Route path="/events/:id" element={<EventDetailUser/>} />
        <Route path="/profile" element={<Profile />} />
        {/* <PrivateRoute path="/admin" component={AdminPage} allowedRoles={['admin']} /> */}
        {/* <PrivateRoute path="/organizer" component={OrganizerPage} allowedRoles={['organizer', 'admin']} /> */}
        {/* <PrivateRoute path="/user" component={UserPage} allowedRoles={['user', 'organizer', 'admin']} /> */}
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
        <Route path="/create-user" element={<CreateUserForm />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/my-events" element={
          <PrivateRoute allowedRoles={['organizer', 'admin']}>
            <EventList />
          </PrivateRoute>} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/event/:id/registrations" element={<RegistrationList />} />
      </Routes>
      <Footer />
>>>>>>> Stashed changes
    </div>

  );
}

export default App;

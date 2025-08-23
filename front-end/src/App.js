import './App.css';
import Login from './components/auth/Login';
import { Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import EventList from './components/pages/EventList';
import EventDetail from './components/pages/EventDetail';
import RegistrationList from './components/pages/RegistrationList';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './context/PrivateRoute';
import AdminDashboard from './components/pages/admin/Management';
import CreateUserForm from './components/pages/admin/CreateAccount';
import UserDetail from './components/pages/admin/UserDetail';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <PrivateRoute path="/admin" component={AdminPage} allowedRoles={['admin']} />
        <PrivateRoute path="/organizer" component={OrganizerPage} allowedRoles={['organizer', 'admin']} />
        <PrivateRoute path="/user" component={UserPage} allowedRoles={['user', 'organizer', 'admin']} />
        <Route path="/acc-manage" element={<AdminDashboard />} />
        <Route path="/create-user" element={<CreateUserForm />} />
        <Route path="/user/:id" element={<UserDetail />} />
        <Route path="/my-events" element={<EventList />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/event/:id/registrations" element={<RegistrationList />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

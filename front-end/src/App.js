import './App.css';
import Login from './components/auth/Login';
import { Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './context/PrivateRoute';

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
      </Routes>
      <Footer />
    </div>

  );
}

export default App;

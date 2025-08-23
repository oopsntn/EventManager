import './App.css';
import Login from './components/auth/Login';
import { Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import EventList from './components/pages/EventList';
import EventDetail from './components/pages/EventDetail';
import RegistrationList from './components/pages/RegistrationList';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div>
      <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-events" element={<EventList />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/event/:id/registrations" element={<RegistrationList />} />
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;

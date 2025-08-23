import './App.css';
import Login from './components/auth/Login';
import { Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

function App() {
  return (
    <div>
      <Header/>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
    <Footer/>
    </div>

  );
}

export default App;

import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:9999/api/auth';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData){
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            if(response.data.token){
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            setIsAuthenticated(true);
            setUser(response.data.user);

            return response.data;
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            throw error.response ? error.response.data : { message: "Login Failed" };
        }
    }
    const handleGoogleCallback = (token, userData) => {
        try {
            localStorage.setItem('token', token);
            localStorage.setItem('user', userData);
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
            return JSON.parse(userData);
        } catch (error) {
            console.error('Google callback error:', error);
            setIsAuthenticated(false);
            setUser(null);
            throw error;
        }
    };
    const register = async (name, email, password, phone) => {
        try {
            const response = await axios.post(`${API_URL}/register`, {name, email, password, phone});
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : {message : "Registration Failed"};
        }
    }
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
    }

    if (loading){
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register, handleGoogleCallback, useAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context){
            throw new Error("useAuth must be used within an AuthProvider");
        }
        return context;
    };

export default AuthContext;
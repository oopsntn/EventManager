import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsSuccess(false);

        try {
            console.log('Sending forgot password request for:', email);
            
            const response = await axios.post('http://localhost:9999/api/auth/forgot-password', { 
                email 
            });
            
            console.log('Response:', response.data);
            
            setMessage(response.data.message);
            setIsSuccess(response.data.success || true);
            setEmail(''); // Clear email field
        } catch (error) {
            console.error('Forgot password error:', error);
            
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi email';
            setMessage(errorMessage);
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <div className="icon">
                    <i className="fas fa-lock"></i>
                </div>
                <h2>Quên mật khẩu?</h2>
                <p className="description">
                    Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
                </p>

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                        <label htmlFor="email">Địa chỉ email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-paper-plane"></i>
                                Gửi liên kết đặt lại
                            </>
                        )}
                    </button>
                </form>

                {message && (
                    <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                        <i className={`fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {message}
                    </div>
                )}

                <div className="back-to-login">
                    <Link to="/login">
                        <i className="fas fa-arrow-left"></i>
                        Quay lại đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

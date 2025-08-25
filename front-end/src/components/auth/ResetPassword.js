import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');

    // Kiểm tra độ mạnh của mật khẩu
    const checkPasswordStrength = (password) => {
        if (password.length < 6) {
            setPasswordStrength('weak');
        } else if (password.length < 8) {
            setPasswordStrength('medium');
        } else if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
            setPasswordStrength('strong');
        } else {
            setPasswordStrength('medium');
        }
    };

    useEffect(() => {
        if (password) {
            checkPasswordStrength(password);
        } else {
            setPasswordStrength('');
        }
    }, [password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsSuccess(false);

        // Kiểm tra mật khẩu
        if (password.length < 6) {
            setMessage('Mật khẩu phải có ít nhất 6 ký tự');
            setIsSuccess(false);
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Mật khẩu xác nhận không khớp');
            setIsSuccess(false);
            setLoading(false);
            return;
        }

        try {
            console.log('Resetting password with token:', token);
            
            const response = await axios.post(`http://localhost:9999/api/auth/reset-password/${token}`, {
                password
            });
            
            console.log('Response:', response.data);
            
            setMessage(response.data.message);
            setIsSuccess(response.data.success || true);
            
            if (response.data.success || response.status === 200) {
                // Chuyển hướng về trang login sau 3 giây
                setTimeout(() => {
                    navigate('/login?reset=success');
                }, 3000);
            }
        } catch (error) {
            console.error('Reset password error:', error);
            
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu';
            setMessage(errorMessage);
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'weak': return '#ff4757';
            case 'medium': return '#ffa502';
            case 'strong': return '#2ed573';
            default: return '#ddd';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
            case 'weak': return 'Yếu';
            case 'medium': return 'Trung bình';
            case 'strong': return 'Mạnh';
            default: return '';
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-card">
                <div className="icon">
                    <i className="fas fa-key"></i>
                </div>
                <h2>Đặt lại mật khẩu</h2>
                <p className="description">
                    Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                </p>

                <form onSubmit={handleSubmit} className="reset-password-form">
                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu mới</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                required
                                disabled={loading}
                                minLength="6"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {password && (
                            <div className="password-strength">
                                <div 
                                    className="strength-bar"
                                    style={{ backgroundColor: getPasswordStrengthColor() }}
                                ></div>
                                <span 
                                    className="strength-text"
                                    style={{ color: getPasswordStrengthColor() }}
                                >
                                    {getPasswordStrengthText()}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                        <div className="password-input-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                required
                                disabled={loading}
                                minLength="6"
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={loading}
                            >
                                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <div className="password-mismatch">
                                <i className="fas fa-exclamation-triangle"></i>
                                Mật khẩu không khớp
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading || password !== confirmPassword} className="submit-btn">
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check"></i>
                                Đặt lại mật khẩu
                            </>
                        )}
                    </button>
                </form>

                {message && (
                    <div className={`message ${isSuccess ? 'success' : 'error'}`}>
                        <i className={`fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {message}
                        {isSuccess && (
                            <div className="redirect-info">
                                <i className="fas fa-info-circle"></i>
                                Đang chuyển hướng về trang đăng nhập...
                            </div>
                        )}
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

export default ResetPassword;

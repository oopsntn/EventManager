import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'react-bootstrap';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const {login} = useAuth();

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // login trả về thông tin user
        const loggedInUser = await login(email, password);
            const role = loggedInUser.user.role; // lấy từ user object

            if (role === 'user') navigate('/');
            else if (role === 'organizer') navigate('/my-events');
            else if (role === 'admin') navigate('/admin/acc-manage');

    } catch (error) {
        setError(error.message || 'Login failed');
        setLoading(false);
    }
};


    return (
        <div className='login-container'>
            <form onSubmit={handleSubmit}>
                <div className='form-group'>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Nhập email"
                        required
                        disabled={loading}/>
                </div>

                <div className='form-group'>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Nhập mật khẩu'
                        required
                        disabled={loading}/>
                </div>

                {error && (
                    <div className='error-message'>
                        {error}
                    </div>
                )}

                <Button type='submit' disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>

                <div className='form-footer'>
                    <span>Bạn chưa có tài khoản? </span>
                    <a href="/register">Đăng ký ngay</a>
                </div>
            </form>
        </div>
    );
}

export default Login;
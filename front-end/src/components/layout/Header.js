// src/components/layout/Header.js
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout(); // Gọi hàm logout
        navigate('/login'); // Chuyển hướng về trang chính
    };

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        
                        {isAuthenticated && (
                            <>
                                {user.role === 'admin' && (
                                    <>
                                    <Nav.Link as={Link} to="/admin/acc-manage">Bảng điều khiển</Nav.Link>
                                    {/* <Nav.Link as={Link} to="/admin/notifications">Quản lý thông báo</Nav.Link> */}
                                    <Nav.Link as={Link} to="/profile">Hồ sơ</Nav.Link>
                                    </>
                                )}
                                {user.role === 'organizer' && (
                                    <>
                                    <Nav.Link as={Link} to="/my-events">Events của tôi</Nav.Link>
                                    <Nav.Link as={Link} to="/organizer/dashboard">Bảng điều khiển Tổ chức</Nav.Link>
                                    <Nav.Link as={Link} to="/profile">Hồ sơ</Nav.Link>
                                    </>
                                )}
                                {user.role === 'user' && (
                                    <>
                                        <Navbar.Brand as={Link} to="/">
                                            🎉 EventManager
                                        </Navbar.Brand>
                                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                                        <Nav.Link as={Link} to="/profile">Hồ sơ</Nav.Link>
                                        <Nav.Link as={Link} to="/registrations">
                                        Sự kiện bạn đã đăng ký
                                        </Nav.Link>
                                    </>
                                )}
                                
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {isAuthenticated ? (
                            <>
                                <Navbar.Text className="me-3">
                                    Xin chào, {user?.name || 'Người dùng'}
                                </Navbar.Text>
                                <Nav.Link onClick={logout}>Đăng xuất</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                                <Nav.Link as={Link} to="/register">Đăng ký</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Header;

// src/components/layout/Header.js
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">
                    My App
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={Link} to="/dashboard">Bảng điều khiển</Nav.Link>
                                <Nav.Link as={Link} to="/profile">Hồ sơ</Nav.Link>
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

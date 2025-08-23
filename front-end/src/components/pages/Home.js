import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Row, Col, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8} className="text-center">
                    <h1 className="display-4 mb-4">🎉 Chào mừng đến với EventManager</h1>
                    <p className="lead mb-5">
                        Nền tảng quản lý sự kiện hiện đại, giúp bạn tạo, quản lý và theo dõi các sự kiện một cách hiệu quả.
                    </p>
                    
                    <div className="mb-5">
                        <Link to="/my-events">
                            <Button variant="primary" size="lg" className="me-3">
                                Xem Events của tôi
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline-primary" size="lg">
                                Đăng nhập
                            </Button>
                        </Link>
                    </div>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col md={4}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h3>📅 Quản lý Events</h3>
                            <p>Tạo, chỉnh sửa và quản lý các sự kiện của bạn một cách dễ dàng.</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h3>👥 Quản lý Đăng ký</h3>
                            <p>Theo dõi và phê duyệt đăng ký tham gia từ người dùng.</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <h3>📊 Thống kê</h3>
                            <p>Xem thống kê chi tiết về sự kiện và người tham gia.</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Home;
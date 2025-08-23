// src/components/layout/Footer.js
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
    return (
        <footer className="bg-light py-4 mt-5">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>Về chúng tôi</h5>
                        <p>Thông tin về ứng dụng và dịch vụ của chúng tôi.</p>
                    </Col>
                    <Col md={4}>
                        <h5>Liên hệ</h5>
                        <p>Email: contact@example.com</p>
                        <p>Điện thoại: 0123 456 789</p>
                    </Col>
                    <Col md={4}>
                        <h5>Theo dõi chúng tôi</h5>
                        <div>
                            <a href="#" className="me-2">Facebook</a>
                            <a href="#" className="me-2">Instagram</a>
                            <a href="#" className="me-2">Twitter</a>
                        </div>
                    </Col>
                </Row>
                <hr />
                <div className="text-center">
                    <p>&copy; 2025 My App. Bản quyền được bảo lưu.</p>
                </div>
            </Container>
        </footer>
    );
}

export default Footer;

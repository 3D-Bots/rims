import { Container, Row, Col } from 'react-bootstrap';

export default function Welcome() {
  return (
    <div className="bg-light p-5 rounded">
      <Container>
        <Row className="align-items-center">
          <Col md={3} className="text-center">
            <div
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: '#0d6efd',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 auto',
              }}
            >
              RIMS
            </div>
          </Col>
          <Col md={9}>
            <h1>React Inventory Management System (RIMS)</h1>
            <p className="lead">
              RIMS is an Open Source Inventory Management System designed primarily to keep track
              of electronic parts and components. It will allow you to keep track of your available
              parts and assist you with re-ordering parts.
            </p>
            <h3>Project Status</h3>
            <p>
              This project is currently in an early alpha stage. Code quality is improving constantly.
              However, this project is not ready for production yet.
            </p>
            <p>
              <a
                href="https://github.com/DamageLabs/rims"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View on GitHub
              </a>
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

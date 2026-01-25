import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { showSuccess } = useAlert();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showSuccess('Signed out successfully.');
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          RIMS
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <NavDropdown title="Inventory" id="inventory-dropdown">
                <NavDropdown.Item as={Link} to="/items">
                  All Items
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/items/new">
                  New Item
                </NavDropdown.Item>
              </NavDropdown>
            )}
            {isAdmin && (
              <Nav.Link as={Link} to="/users">
                Users
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <NavDropdown title={user?.email} id="account-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/profile">
                  Edit Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/register">
                  Sign up
                </Nav.Link>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

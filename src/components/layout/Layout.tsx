import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import AlertDisplay from '../common/AlertDisplay';

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container className="flex-grow-1 mt-5 pt-4">
        <AlertDisplay />
        <Outlet />
      </Container>
      <Footer />
    </div>
  );
}

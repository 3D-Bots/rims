import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';
import AlertDisplay from '../common/AlertDisplay';
import ShortcutHelp from '../common/ShortcutHelp';
import { useKeyboardShortcuts, useShortcutHelp } from '../../hooks/useKeyboardShortcuts';

export default function Layout() {
  const { showHelp, openHelp, closeHelp } = useShortcutHelp();
  useKeyboardShortcuts(openHelp);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container className="flex-grow-1 mt-5 pt-4">
        <AlertDisplay />
        <Outlet />
      </Container>
      <Footer />
      <ShortcutHelp show={showHelp} onClose={closeHelp} />
    </div>
  );
}

import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="mt-5 py-4 text-center text-muted border-top">
      <Container>
        <p className="mb-0">
          RIMS - React Inventory Management System
        </p>
        <p className="mb-0">
          <a
            href="https://github.com/DamageStudios/rims"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </Container>
    </footer>
  );
}

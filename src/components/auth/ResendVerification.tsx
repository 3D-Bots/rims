import { useState, FormEvent, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { resendVerificationEmail } from '../../services/authService';

export default function ResendVerification() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await resendVerificationEmail(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-success">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">Email Sent</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="success">
                <Alert.Heading>Check Your Inbox</Alert.Heading>
                <p>
                  If an account exists for <strong>{email}</strong>, we've sent a new verification email.
                </p>
                <p className="mb-0">
                  Please check your inbox and spam folder.
                </p>
              </Alert>
              <div className="d-grid gap-2 mt-3">
                <Link to="/login" className="btn btn-primary">
                  Back to Sign In
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="justify-content-center">
      <Col md={6} lg={4}>
        <Card className="border-primary">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">Resend Verification Email</h4>
          </Card.Header>
          <Card.Body>
            <p className="text-muted">
              Enter your email address and we'll send you a new verification link.
            </p>
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus={!email}
                  disabled={isLoading}
                  placeholder="your@email.com"
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Email'}
                </Button>
              </div>
            </Form>
            <div className="mt-3 text-center">
              <Link to="/login" className="btn btn-link">
                Back to Sign In
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

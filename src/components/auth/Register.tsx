import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { register } = useAuth();
  const { showError } = useAlert();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await register({ email, password, passwordConfirmation });
      if (result.success) {
        setRegistrationComplete(true);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="border-success">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">Check Your Email</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="success">
                <Alert.Heading>Registration Successful!</Alert.Heading>
                <p>
                  We've sent a verification email to <strong>{email}</strong>.
                </p>
                <p className="mb-0">
                  Please click the link in the email to verify your account before signing in.
                </p>
              </Alert>
              <hr />
              <p className="text-muted small">
                Didn't receive the email? Check your spam folder or{' '}
                <Link to={`/resend-verification?email=${encodeURIComponent(email)}`}>
                  request a new verification email
                </Link>.
              </p>
              <div className="d-grid gap-2 mt-3">
                <Link to="/login" className="btn btn-primary">
                  Go to Sign In
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
            <h4 className="mb-0">Register an Account</h4>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                />
                <Form.Text className="text-muted">
                  Minimum 8 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3" controlId="passwordConfirmation">
                <Form.Label>Password Confirmation</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register'}
                </Button>
              </div>
            </Form>
            <div className="mt-3 text-center">
              <Link to="/login" className="btn btn-link">
                Already have an account? Sign in
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { verifyEmail } from '../services/authService';

type VerificationStatus = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided.');
      return;
    }

    verifyEmail(token)
      .then(() => {
        setStatus('success');
      })
      .catch((error) => {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
      });
  }, [searchParams]);

  return (
    <Row className="justify-content-center">
      <Col md={6} lg={4}>
        {status === 'loading' && (
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Verifying Email</h4>
            </Card.Header>
            <Card.Body className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Please wait while we verify your email address...</p>
            </Card.Body>
          </Card>
        )}

        {status === 'success' && (
          <Card className="border-success">
            <Card.Header className="bg-success text-white">
              <h4 className="mb-0">Email Verified</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="success">
                <Alert.Heading>Success!</Alert.Heading>
                <p className="mb-0">
                  Your email address has been verified. You can now sign in to your account.
                </p>
              </Alert>
              <div className="d-grid gap-2 mt-3">
                <Link to="/login" className="btn btn-success">
                  Sign In
                </Link>
              </div>
            </Card.Body>
          </Card>
        )}

        {status === 'error' && (
          <Card className="border-danger">
            <Card.Header className="bg-danger text-white">
              <h4 className="mb-0">Verification Failed</h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="danger">
                <Alert.Heading>Unable to Verify Email</Alert.Heading>
                <p className="mb-0">{errorMessage}</p>
              </Alert>
              <hr />
              <p className="text-muted">
                The verification link may have expired or already been used. You can request a new verification email.
              </p>
              <div className="d-grid gap-2 mt-3">
                <Link to="/resend-verification" className="btn btn-primary">
                  Request New Verification Email
                </Link>
                <Link to="/login" className="btn btn-outline-secondary">
                  Back to Sign In
                </Link>
              </div>
            </Card.Body>
          </Card>
        )}
      </Col>
    </Row>
  );
}

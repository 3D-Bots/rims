import { Alert } from 'react-bootstrap';
import { useAlert } from '../../contexts/AlertContext';

export default function AlertDisplay() {
  const { alerts, dismissAlert } = useAlert();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.type}
          dismissible
          onClose={() => dismissAlert(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}

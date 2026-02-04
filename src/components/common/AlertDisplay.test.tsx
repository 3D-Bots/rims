import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertDisplay from './AlertDisplay';
import * as AlertContext from '../../contexts/AlertContext';

vi.mock('../../contexts/AlertContext', () => ({
  useAlert: vi.fn(),
}));

describe('AlertDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there are no alerts', () => {
    vi.mocked(AlertContext.useAlert).mockReturnValue({
      alerts: [],
      showAlert: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      dismissAlert: vi.fn(),
    });

    const { container } = render(<AlertDisplay />);

    expect(container.firstChild).toBeNull();
  });

  it('renders alerts with correct variant', () => {
    vi.mocked(AlertContext.useAlert).mockReturnValue({
      alerts: [
        { id: 1, type: 'success', message: 'Success message' },
        { id: 2, type: 'danger', message: 'Error message' },
      ],
      showAlert: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      dismissAlert: vi.fn(),
    });

    render(<AlertDisplay />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('calls dismissAlert when alert is closed', () => {
    const dismissAlert = vi.fn();
    vi.mocked(AlertContext.useAlert).mockReturnValue({
      alerts: [{ id: 1, type: 'info', message: 'Test message' }],
      showAlert: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      dismissAlert,
    });

    render(<AlertDisplay />);

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(dismissAlert).toHaveBeenCalledWith(1);
  });

  it('renders multiple alerts', () => {
    vi.mocked(AlertContext.useAlert).mockReturnValue({
      alerts: [
        { id: 1, type: 'success', message: 'First alert' },
        { id: 2, type: 'warning', message: 'Second alert' },
        { id: 3, type: 'info', message: 'Third alert' },
      ],
      showAlert: vi.fn(),
      showSuccess: vi.fn(),
      showError: vi.fn(),
      showWarning: vi.fn(),
      dismissAlert: vi.fn(),
    });

    render(<AlertDisplay />);

    expect(screen.getByText('First alert')).toBeInTheDocument();
    expect(screen.getByText('Second alert')).toBeInTheDocument();
    expect(screen.getByText('Third alert')).toBeInTheDocument();
  });
});

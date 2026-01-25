import { Link } from 'react-router-dom';
import { Form, Button, ButtonGroup } from 'react-bootstrap';
import { UserWithoutPassword, UserRole } from '../../types/User';

interface UserRowProps {
  user: UserWithoutPassword;
  currentUserId?: number;
  onRoleChange: (userId: number, role: UserRole) => void;
  onDelete: () => void;
}

const ROLES: UserRole[] = ['user', 'vip', 'admin'];

export default function UserRow({ user, currentUserId, onRoleChange, onDelete }: UserRowProps) {
  const isCurrentUser = user.id === currentUserId;

  return (
    <tr>
      <td>
        <Link to={`/users/${user.id}`}>{user.email}</Link>
      </td>
      <td>
        <Form.Select
          size="sm"
          value={user.role}
          onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
          style={{ width: '120px' }}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </Form.Select>
      </td>
      <td>
        <ButtonGroup size="sm">
          <Button
            variant="primary"
            onClick={() => onRoleChange(user.id, user.role)}
          >
            Change Role
          </Button>
          {!isCurrentUser && (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
        </ButtonGroup>
      </td>
    </tr>
  );
}

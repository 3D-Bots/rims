import { useState, useEffect } from 'react';
import { Card, Table } from 'react-bootstrap';
import * as userService from '../../services/userService';
import { UserWithoutPassword, UserRole } from '../../types/User';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import UserRow from './UserRow';
import ConfirmModal from '../common/ConfirmModal';

export default function UserList() {
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [deleteModalUser, setDeleteModalUser] = useState<UserWithoutPassword | null>(null);
  const { user: currentUser } = useAuth();
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = userService.getAllUsers();
    setUsers(allUsers);
  };

  const handleRoleChange = (userId: number, newRole: UserRole) => {
    const updatedUser = userService.updateUserRole(userId, newRole);
    if (updatedUser) {
      showSuccess('User role updated successfully.');
      loadUsers();
    } else {
      showError('Failed to update user role.');
    }
  };

  const handleDelete = () => {
    if (!deleteModalUser || !currentUser) return;

    try {
      const success = userService.deleteUser(deleteModalUser.id, currentUser.id);
      if (success) {
        showSuccess('User was successfully deleted.');
        loadUsers();
      } else {
        showError('Failed to delete user.');
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete user.');
    }
    setDeleteModalUser(null);
  };

  return (
    <Card>
      <Card.Header>
        <h4 className="mb-0">User List</h4>
      </Card.Header>
      <Card.Body>
        <Table hover responsive>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUser?.id}
                onRoleChange={handleRoleChange}
                onDelete={() => setDeleteModalUser(user)}
              />
            ))}
          </tbody>
        </Table>
      </Card.Body>

      <ConfirmModal
        show={!!deleteModalUser}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModalUser?.email}"?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalUser(null)}
      />
    </Card>
  );
}

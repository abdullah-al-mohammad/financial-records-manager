import { useState } from 'react';
import { api } from '../../utils/api';

// Owns the admin user form, add/edit/delete flows and submission state.
export default function useAdminUsers({ currentUser, onShowToast, loadData }) {
  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [status, setStatus] = useState('Active');
  const [editingUsername, setEditingUsername] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false); // form mutation in progress

  const handleUserSubmit = async e => {
    e.preventDefault();
    if (!username.trim() || (!editingUsername && !password)) {
      onShowToast('Username and password are required', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUsername) {
        // Edit Existing User
        const payload = {
          username: editingUsername,
          role,
          status,
          ...(password ? { password } : {}), // Only update password if entered
        };
        await api.updateUser(payload);
        onShowToast(`User account "${editingUsername}" updated!`);
      } else {
        // Create New User
        await api.createUser({
          username: username.trim(),
          password,
          role,
          status,
        });
        onShowToast(`User account "${username.trim()}" created!`);
      }

      // Reset form
      setUsername('');
      setPassword('');
      setRole('User');
      setStatus('Active');
      setEditingUsername(null);
      setShowAddForm(false);

      // Reload lists silently (keep existing data visible)
      await loadData({ silent: true });
    } catch (err) {
      onShowToast(err.message || 'Failed to save user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditUser = user => {
    setEditingUsername(user.username);
    setUsername(user.username);
    setPassword('');
    setRole(user.role);
    setStatus(user.status);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteUser = async targetUser => {
    if (targetUser.toLowerCase() === currentUser.username.toLowerCase()) {
      onShowToast('Safety lock: You cannot delete your own admin account.', 'error');
      return;
    }

    if (!window.confirm(`Delete user account "${targetUser}" permanently from database?`)) return;

    setIsSubmitting(true);
    try {
      await api.deleteUser(targetUser);
      onShowToast(`User "${targetUser}" deleted successfully.`);
      await loadData({ silent: true });
    } catch (err) {
      onShowToast(err.message || 'Delete failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setEditingUsername(null);
    setUsername('');
    setPassword('');
    setRole('User');
    setStatus('Active');
  };

  const cancelEdit = () => {
    setShowAddForm(false);
    setEditingUsername(null);
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    role,
    setRole,
    status,
    setStatus,
    editingUsername,
    showAddForm,
    isSubmitting,
    handleUserSubmit,
    startEditUser,
    handleDeleteUser,
    toggleAddForm,
    cancelEdit,
  };
}

import UserCard from './UserCard';

// Responsive grid of user account cards.
export default function UsersGrid({ users, currentUser, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(u => {
        const isSelf = u.username.toLowerCase() === currentUser.username.toLowerCase();
        return (
          <UserCard key={u.username} user={u} isSelf={isSelf} onEdit={onEdit} onDelete={onDelete} />
        );
      })}
    </div>
  );
}

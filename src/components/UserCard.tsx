"use client";

type UserCardProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  updating: boolean;
  onRoleChange: (email: string, role: string) => void;
  onDelete: (email: string) => void;
};

export default function UserCard({
  user,
  updating,
  onRoleChange,
  onDelete,
}: UserCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 border border-gray-300">
      <div className="flex-1">
        <p className="text-lg font-semibold text-gray-800">{user.name}</p>
        <p className="text-gray-500">{user.email}</p>
        <p className="text-gray-400 text-sm">UID: {user.id}</p>
      </div>

      <div className="flex items-center gap-4 mt-3 sm:mt-0">
        {user.role === "admin" ? (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
            {user.role}
          </span>
        ) : (
          <select
            value={user.role}
            onChange={(e) => onRoleChange(user.email, e.target.value)}
            className="border border-gray-300 px-3 py-0 height-[40px]"
            disabled={updating}
          >
            <option value="subscriber">Subscriber</option>
            <option value="teacher">Teacher</option>
            <option value="moderator">Moderator</option>
            <option value="student">Student</option>
          </select>
        )}

        {user.role !== "admin" && (
          <button
            onClick={() => onDelete(user.email)}
            disabled={updating}
            className="px-3 py-1 bg-red-600 border border-red-700 text-white height-[40px] hover:bg-red-700 transition"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

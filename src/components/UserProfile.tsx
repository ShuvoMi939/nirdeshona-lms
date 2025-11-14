// components/UserProfile.tsx
export default function UserProfile({
  user,
  editable = false,
  onEdit,
}: {
  user: any;
  editable?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{user.name}</h2>
        {editable && onEdit && (
          <button onClick={onEdit} className="text-blue-600">Edit</button>
        )}
      </div>
      <p><strong>Bio:</strong> {user.bio || "N/A"}</p>
      <p><strong>Gender:</strong> {user.gender || "N/A"}</p>
      <p><strong>DOB:</strong> {user.dob || "N/A"}</p>
      <p><strong>Current City:</strong> {user.currentCity || "N/A"}</p>
      <p><strong>Hometown:</strong> {user.hometown || "N/A"}</p>
      <p><strong>Education:</strong> {user.education || "N/A"}</p>
      <p><strong>Work:</strong> {user.work || "N/A"}</p>
      {editable && <p><strong>Email:</strong> {user.email}</p>}
      {editable && <p><strong>Contact:</strong> {user.contact || "N/A"}</p>}
    </div>
  );
}

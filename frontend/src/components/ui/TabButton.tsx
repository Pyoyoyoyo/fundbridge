export function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium ${
        isActive
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-blue-500'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

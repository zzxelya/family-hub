import { Member } from "@/lib/types";

export default function MemberAvatar({
  member,
  size = "md",
  withRing = false,
}: {
  member: Member;
  size?: "sm" | "md" | "lg";
  withRing?: boolean;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
  };

  const ringClass = withRing ? "ring-2 ring-white ring-offset-1 ring-offset-transparent" : "";

  return (
    <div
      className={`${sizeClasses[size]} ${ringClass} rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {member.avatar_url ? (
        <img
          src={member.avatar_url}
          alt={member.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        member.name.charAt(0)
      )}
    </div>
  );
}

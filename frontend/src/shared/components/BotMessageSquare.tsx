import { LucideProps } from "lucide-react";

export const BotMessageSquare = (props: LucideProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="10" r="2" />
      <path d="M12 14v2" />
      <path d="M8.5 8.5L9.5 9.5" />
      <path d="M14.5 9.5l1-1" />
    </svg>
  );
};

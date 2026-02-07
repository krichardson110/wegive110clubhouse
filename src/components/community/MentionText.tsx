import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface MentionTextProps {
  text: string;
  className?: string;
}

// Regex to match @mentions (handles underscores for multi-word names)
const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

const MentionText = ({ text, className }: MentionTextProps) => {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;

  // Reset regex state
  MENTION_REGEX.lastIndex = 0;

  while ((match = MENTION_REGEX.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add the mention as a highlighted span
    const mentionText = match[0];
    const username = match[1].replace(/_/g, " ");
    
    parts.push(
      <span
        key={match.index}
        className="text-primary font-medium cursor-pointer hover:underline"
        title={username}
      >
        @{username}
      </span>
    );

    lastIndex = match.index + mentionText.length;
  }

  // Add remaining text after last mention
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no mentions found, just return the text
  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={cn("break-words", className)}>
      {parts.map((part, index) => (
        <Fragment key={index}>{part}</Fragment>
      ))}
    </span>
  );
};

export default MentionText;

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/community";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const MentionInput = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Write a comment...",
  className,
  disabled,
  autoFocus,
}: MentionInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Fetch profiles for mention suggestions
  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles-for-mentions", mentionSearch],
    queryFn: async () => {
      let query = supabase
        .from("profiles_public")
        .select("*")
        .limit(5);
      
      if (mentionSearch) {
        query = query.ilike("display_name", `%${mentionSearch}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    },
    enabled: showMentions,
  });

  // Handle input change and detect @ mentions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    
    // Find the @ symbol before cursor
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      // Check if @ is at start or after a space
      const charBefore = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : " ";
      if (charBefore === " " || lastAtIndex === 0) {
        const searchText = textBeforeCursor.slice(lastAtIndex + 1);
        // Only show if no space after @
        if (!searchText.includes(" ")) {
          setMentionStartIndex(lastAtIndex);
          setMentionSearch(searchText);
          setShowMentions(true);
          setSelectedIndex(0);
          return;
        }
      }
    }
    
    setShowMentions(false);
    setMentionSearch("");
    setMentionStartIndex(-1);
  };

  // Handle selecting a mention
  const selectMention = (profile: Profile) => {
    if (mentionStartIndex === -1 || !profile.display_name) return;
    
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(mentionStartIndex + mentionSearch.length + 1);
    const mentionText = `@${profile.display_name.replace(/\s+/g, "_")} `;
    
    const newValue = beforeMention + mentionText + afterMention;
    onChange(newValue);
    
    setShowMentions(false);
    setMentionSearch("");
    setMentionStartIndex(-1);
    
    // Focus back on input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = beforeMention.length + mentionText.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && profiles.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % profiles.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectMention(profiles[selectedIndex]);
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowMentions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("bg-secondary/30", className)}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      
      {showMentions && profiles.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 mb-1 w-full max-w-xs bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="p-1">
            <div className="text-xs text-muted-foreground px-2 py-1">
              Mention someone
            </div>
            {profiles.map((profile, index) => {
              const displayName = profile.display_name || "Team Member";
              const initials = displayName.slice(0, 2).toUpperCase();
              
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => selectMention(profile)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                    index === selectedIndex
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-secondary"
                  )}
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-secondary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">
                    {displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentionInput;

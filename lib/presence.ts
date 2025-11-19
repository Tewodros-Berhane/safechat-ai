import { formatDistanceToNow } from "date-fns";

interface PresenceOptions {
  isPrivate?: boolean;
  isOnline?: boolean;
  lastSeen?: string | Date | null;
}

export function getPresenceInfo(options: PresenceOptions) {
  const { isPrivate, isOnline, lastSeen } = options;

  if (isPrivate) {
    return {
      text: "Last seen recently",
      showDot: false,
    };
  }

  if (isOnline) {
    return {
      text: "Active now",
      showDot: true,
    };
  }

  if (lastSeen) {
    return {
      text: `Active ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`,
      showDot: false,
    };
  }

  return {
    text: "Last seen recently",
    showDot: false,
  };
}

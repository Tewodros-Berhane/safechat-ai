"use client";

interface MessageBubbleProps {
  text: string;
  sender: string;
}

export default function MessageBubble({ text, sender }: MessageBubbleProps) {
  const isUser = sender === "You";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? "bg-[#007AFF] text-white"
            : "bg-white border border-gray-200 text-gray-900"}
        `}
      >
        {text}
      </div>
    </div>
  );
}

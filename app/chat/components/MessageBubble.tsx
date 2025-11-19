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
            ? "bg-[#04C99B] text-white shadow-sm"
            : "bg-white border border-slate-200 text-slate-900 shadow-xs"}
        `}
      >
        {text}
      </div>
    </div>
  );
}

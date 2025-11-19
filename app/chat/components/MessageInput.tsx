"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendIcon } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border-slate-200 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-[#04C99B]/40 focus-visible:border-[#04C99B]"
      />
      <Button
        type="submit"
        className="bg-[#04C99B] hover:bg-[#03b387] text-white shadow-md"
      >
        <SendIcon className="w-4 h-4" />
      </Button>
    </form>
  );
}

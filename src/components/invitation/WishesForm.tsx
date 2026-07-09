"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";

interface WishesFormProps {
  guestName: string;
  attendance: "attending" | "not_attending";
  onSubmitted?: () => void;
}

export default function WishesForm({
  guestName,
  attendance,
  onSubmitted,
}: WishesFormProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name: guestName,
          message,
          attendance,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send wish.");
        return;
      }

      setMessage("");
      setSuccess(true);
      onSubmitted?.();
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wish-letter-form overflow-hidden rounded-2xl border border-royal/15 bg-[#fffdf8] p-7 shadow-card lg:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-royal/10">
          <MessageSquare className="h-5 w-5 text-royal" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-royal">
            Your Letter
          </p>
          <p className="text-sm text-stone-500">
            Write a wish for {guestName}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            Your wish was sent successfully. Thank you!
          </div>
        )}

        <div>
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Dear William & Jessica, we wish you..."
            rows={5}
            maxLength={500}
            className="input-field resize-none"
            required
          />
          <p className="mt-1 text-right text-[10px] text-stone-400">
            {message.length}/500
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="btn-invite-primary w-full"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Sending..." : "Send Letter"}
        </button>
      </form>
    </div>
  );
}

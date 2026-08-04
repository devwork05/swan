export default function ChatWidget() {
  return (
    <button
      aria-label="Chat with us"
      className="chat-ping fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-brand-red py-3.5 pl-5 pr-4 shadow-[0_10px_30px_-8px_rgba(193,18,31,0.6)] transition-colors hover:bg-brand-darkred"
    >
      <span className="relative flex">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff">
          <path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.3-.6L3 21l1.7-4.4C3.6 15.2 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
        </svg>
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-brand-red bg-[#22c55e]" />
      </span>
      <span className="font-montserrat text-[13px] font-bold text-white">Chat</span>
    </button>
  );
}

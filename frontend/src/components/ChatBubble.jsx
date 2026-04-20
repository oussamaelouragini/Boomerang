import Avatar from "./Avatar";

export default function ChatBubble({ message, isOwn }) {
  return (
    <div className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && (
        <Avatar name={message.sender?.name} src={message.sender?.avatar} size="sm" className="mt-1" href={message.sender?._id ? `/users/${message.sender._id}` : undefined} />
      )}
      <div className={`max-w-[70%]`}>
        <div className={`rounded-2xl px-4 py-2.5 ${isOwn ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-white text-dark shadow-card"}`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <p className={`mt-1 px-1 text-[10px] ${isOwn ? "text-right text-muted" : "text-muted"}`}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

import ChatMessage from "./ChatMessage";

const ChatBoard = ({ messages }) => {
    return (
        <div className="chat-container">
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}
        </div>
    );
};

export default ChatBoard;

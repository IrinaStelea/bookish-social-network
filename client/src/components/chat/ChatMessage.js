const ChatMessage = ({ message }) => {
    return (
        <div className="chat-cell" key={message.id}>
            <a href={"/user/" + message.sender_id}>
                <img
                    src={message.avatarurl || "../../no_avatar.png"}
                    alt={message.first + " " + message.last}
                />
            </a>
            <div className="chat-text-posted">
                <p>{message.message}</p>
                <p>
                    Posted by{" "}
                    <a href={"/user/" + message.sender_id}>
                        {message.first} {message.last}
                    </a>{" "}
                    on{" "}
                    {message.timestamp
                        .slice(0, 10)
                        .split("-")
                        .reverse()
                        .join("-")}{" "}
                    at {message.timestamp.slice(11, 19)}
                </p>
            </div>
        </div>
    );
};

export default ChatMessage;

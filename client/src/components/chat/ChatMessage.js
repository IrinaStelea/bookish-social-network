import { Link } from "react-router-dom";

const ChatMessage = ({ message }) => {
    return (
        <div className="chat-cell" key={message.id}>
            <Link to={"/user/" + message.sender_id}>
                <img
                    src={message.avatarurl || "../../no_avatar.png"}
                    alt={message.first + " " + message.last}
                />
            </Link>
            <div className="chat-text-posted">
                <p>
                    <Link to={"/user/" + message.sender_id}>
                        {message.first} {message.last}
                    </Link>
                    : {message.message}
                </p>
                <p>
                    Posted on {message.timestamp
                        .slice(0, 10)
                        .split("-")
                        .reverse()
                        .join("-")}{" "}
                    at {message.timestamp.slice(11, 16)}
                </p>
            </div>
        </div>
    );
};

export default ChatMessage;

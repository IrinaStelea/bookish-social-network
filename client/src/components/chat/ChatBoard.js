import ChatMessage from "./ChatMessage";
import { useEffect, useRef } from "react";

const ChatBoard = ({ messages }) => {
    //create a reference to be able to add scrolling to the chat window
    //TO DO: look into how scrollTop could be used to see the latest message at the bottom of the chatBoard (instead of using CSS flexbox column reverse)
    const chatBoardRef = useRef();

    useEffect(() => {
        // const handleScroll = () => {};
    }, []);
    return (
        <div className="chat-container" ref={chatBoardRef}>
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}
        </div>
    );
};

export default ChatBoard;

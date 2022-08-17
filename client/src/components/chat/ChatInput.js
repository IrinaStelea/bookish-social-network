//button title default value is Reply if no other value is provided from the Chat component

import { useRef } from "react";
import { socket } from "../../socket.js";

const ChatInput = ({
    buttonTitle = "Reply",
    textPlaceholder = "Write a message to the Bookish community",
}) => {
    //the hook useRef allows me to gain access to specific DOM elements  - to do so, use the current property of the ref
    const textareaRef = useRef();

    const sendMessage = () => {
        const message = textareaRef.current.value;
        //emit socket event when there is a new message; the server listens to this event
        socket.emit("new-message", {
            text: message,
        });

        textareaRef.current.value = "";
        textareaRef.current.focus();
    };

    //submit the chat message also when clicking on Enter
    const onChange = (e) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            sendMessage();
        }
    };

    return (
        <div className="chat-input">
            <textarea
                cols="40"
                rows="10"
                ref={textareaRef}
                placeholder={textPlaceholder}
                onKeyUp={onChange}
            ></textarea>
            <button onClick={sendMessage}>{buttonTitle}</button>
        </div>
    );
};

export default ChatInput;

//click on button
//emit an event on the socket so the server can grab the new message and store it in the database and then use the socket there to emit the latest messages and eventually updated the global state; simply clicking on button and dispatching (without socket) means the state would update just for me, not for everyone
//update the store

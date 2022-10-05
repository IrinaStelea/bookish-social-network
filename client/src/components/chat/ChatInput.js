import { useRef } from "react";
import { socket } from "../../socket.js";

const ChatInput = ({
    buttonTitle,
    textPlaceholder = "Chat with the Bookish community",
}) => {
    const textareaRef = useRef();

    const sendMessage = () => {
        const message = textareaRef.current.value;
        //socket emits when there is a new message
        socket.emit("new-message", {
            text: message,
        });
        //clear the textarea and keep focus on it
        textareaRef.current.value = "";
        textareaRef.current.focus();
    };

    //submit message when clicking Enter
    const onChange = (e) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            sendMessage();
        }
    };

    return (
        <div className="chat-input">
            <textarea
                cols="40"
                rows="6"
                ref={textareaRef}
                placeholder={textPlaceholder}
                onKeyUp={onChange}
            ></textarea>
            <button onClick={sendMessage}>{buttonTitle}</button>
        </div>
    );
};

export default ChatInput;

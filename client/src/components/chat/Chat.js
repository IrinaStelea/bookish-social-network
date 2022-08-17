import ChatBoard from "./ChatBoard";
import ChatInput from "./ChatInput";

//this component should react to the global state change, pass the messages as property to the chatboard

import { useSelector } from "react-redux";

export default function Chat() {
    const messages = useSelector((state) => state.messages);

    console.log("messages in the main Chat component", messages);
    return (
        <section className="chat">
            <h3>Chat</h3>
            <ChatBoard messages={messages} />
            <ChatInput buttonTitle="Send" />
        </section>
    );
}

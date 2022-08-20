import ChatBoard from "./ChatBoard";
import ChatInput from "./ChatInput";
import OnlineUsers from "./OnlineUsers";

//this component should react to the global state change, pass the messages as property to the chatboard

import { useSelector } from "react-redux";

export default function Chat() {
    const messages = useSelector((state) => state.messages);
    const onlineUsers = useSelector((state) => state.onlineUsers);
    // console.log("messages in the main Chat component", messages);
    return (
        <section className="chat">
            <h3>Chat</h3>
            <OnlineUsers users={onlineUsers} />
            <ChatBoard messages={messages} />
            <ChatInput buttonTitle="Send" />
        </section>
    );
}

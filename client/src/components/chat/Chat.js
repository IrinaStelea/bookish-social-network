import { useSelector } from "react-redux";
import ChatBoard from "./ChatBoard";
import ChatInput from "./ChatInput";
import OnlineUsers from "./OnlineUsers";

export default function Chat() {
    const messages = useSelector((state) => state.messages);
    const onlineUsers = useSelector((state) => state.onlineUsers);

    return (
        <section className="chat">
            <h3>Chat</h3>
            <div className="chat-online-users-container">
                <ChatBoard messages={messages} />
                <OnlineUsers users={onlineUsers} />
            </div>
            <ChatInput buttonTitle="Send" />
        </section>
    );
}

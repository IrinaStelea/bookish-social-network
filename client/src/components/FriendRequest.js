import { useSelector, useDispatch } from "react-redux";
import { socket } from "../socket";
import { resetFriendRequests } from "../redux/notify-friend-request/slice";
import "../css/MainStylesheet.css";

export default function FriendRequest() {
    const dispatch = useDispatch();
    const userData = useSelector((state) => state.userData);

    //get only unique values from the requests array
    let requests = [...new Set(useSelector((state) => state.requests))];

    const resetRequests = () => {
        dispatch(resetFriendRequests());
        socket.emit("all-friend-requests-read", {
            recipient_id: userData.id,
        });
    };

    return (
        <>
            {requests.length > 0 && (
                <div className="friend-notification">
                    <a href="/friends" onClick={resetRequests}>
                        {requests.length}
                    </a>
                </div>
            )}
        </>
    );
}

import { useSelector, useDispatch } from "react-redux";
import { resetFriendRequests } from "../redux/notify-friend-request/slice";
import { socket } from "../socket";
import "./Registration.css";

export default function FriendRequest() {
    const dispatch = useDispatch();

    const userData = useSelector((state) => state.userData);
    //friend requests
    // const requests = useSelector((state) => state.requests);

    //get only unique values from the requests array (use Set)
    let requests = [...new Set(useSelector((state) => state.requests))];
    console.log("requests in friend request component", requests);

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

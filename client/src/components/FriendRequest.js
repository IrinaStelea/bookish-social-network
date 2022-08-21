import "./Registration.css";
import { useDispatch } from "react-redux";
import { resetFriendRequests } from "../redux/notify-friend-request/slice";

export default function FriendRequest({ requests }) {
    const dispatch = useDispatch();

    const resetRequests = () => {
        dispatch(resetFriendRequests());
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

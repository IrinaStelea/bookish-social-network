import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { acceptFriend, rejectFriend } from "../../redux/friends/slice.js";

export default function Wannabes() {
    const dispatch = useDispatch();
    const wannabes = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => !friend.accepted)
    );

    const handleAccept = async (id) => {
        try {
            const res = await fetch("/acceptfriendship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();
            if (!data.message) {
                dispatch(acceptFriend(data[0].sender_id));
            }
        } catch (err) {
            console.log("error in changing friendship status", err);
        }
    };

    const handleUnfriend = async (id) => {
        try {
            const res = await fetch("/cancelfriendship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();
            if (!data.message) {
                dispatch(rejectFriend(id));
            }
        } catch (err) {
            console.log("error in changing friendship status", err);
        }
    };
    return (
        <>
            {(wannabes.length !== 0 && (
                <div className="friends-container">
                    {wannabes.map((wannabe) => {
                        return (
                            <div className="friends-cell" key={wannabe.id}>
                                <Link to={"/user/" + wannabe.id}>
                                    <img
                                        src={
                                            wannabe.avatarurl ||
                                            "../../no_avatar.png"
                                        }
                                        alt={wannabe.first + " " + wannabe.last}
                                    />
                                </Link>
                                <div className="friends-name-button">
                                    <Link to={"/user/" + wannabe.id}>
                                        {wannabe.first} {wannabe.last}
                                    </Link>
                                    <button
                                        className="friend-button"
                                        onClick={() => handleAccept(wannabe.id)}
                                    >
                                        Add as friend
                                    </button>
                                    <button
                                        className="deny-friend-button"
                                        onClick={() =>
                                            handleUnfriend(wannabe.id)
                                        }
                                    >
                                        Do not add
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )) || <p>You have no pending friend requests.</p>}
        </>
    );
}

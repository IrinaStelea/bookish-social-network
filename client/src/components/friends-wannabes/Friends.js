import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { rejectFriend } from "../../redux/friends/slice.js";

export default function Friends() {
    const dispatch = useDispatch();
    const friends = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => friend.accepted)
    );

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
            {(friends.length !== 0 && (
                <div className="friends-container">
                    {friends.map((friend) => {
                        return (
                            <div className="friends-cell" key={friend.id}>
                                <Link to={"/user/" + friend.id}>
                                    <img
                                        src={
                                            friend.avatarurl ||
                                            "../../no_avatar.png"
                                        }
                                        alt={friend.first + " " + friend.last}
                                    />
                                </Link>
                                <div className="friends-name-button">
                                    <Link to={"/user/" + friend.id}>
                                        {friend.first} {friend.last}
                                    </Link>
                                    <button
                                        className="deny-friend-button"
                                        onClick={() =>
                                            handleUnfriend(friend.id)
                                        }
                                    >
                                        Unfriend
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )) || <p>You have no friends.</p>}
        </>
    );
}

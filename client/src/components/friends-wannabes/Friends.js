// import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { rejectFriend } from "../../redux/friends/slice.js";

export default function Friends() {
    const dispatch = useDispatch();
    const friends = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => friend.accepted)
    );
    console.log("friends from the global state", friends);
    const handleUnfriend = async (id) => {
        try {
            const res = await fetch("/cancelfriendship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();
            console.log("data after clicking on unfriend button", data);
            if (!data.message) {
                //prepare the action and dispatch it to our rejectFriend reducer
                console.log("data id is", data);
                console.log("id in reject is", id);
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
                                <a href={"/user/" + friend.id}>
                                    <img
                                        src={
                                            friend.avatarurl ||
                                            "../../no_avatar.png"
                                        }
                                        alt={friend.first + " " + friend.last}
                                    />
                                </a>
                                <div className="friends-name-button">
                                    <a href={"/user/" + friend.id}>
                                        {friend.first} {friend.last}
                                    </a>
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

import { useSelector, useDispatch } from "react-redux";
import { acceptFriend, rejectFriend } from "../../redux/friends/slice.js";

export default function Wannabes() {
    const dispatch = useDispatch();
    const wannabes = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => !friend.accepted)
    );
    // console.log("wannabes from the global state", wannabes);

    const handleAccept = async (id) => {
        try {
            const res = await fetch("/acceptfriendship", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();
            console.log("data after clicking on accept button", data);
            if (!data.message) {
                //prepare the action and dispatch it to our acceptFriend reducer (action = acceptFriend(id))
                console.log("data id is", data[0].sender_id);
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
            {(wannabes.length !== 0 && (
                <div className="friends-container">
                    {wannabes.map((wannabe) => {
                        return (
                            <div className="friends-cell" key={wannabe.id}>
                                <a href={"/user/" + wannabe.id}>
                                    <img
                                        src={
                                            wannabe.avatarurl ||
                                            "../../no_avatar.png"
                                        }
                                        alt={wannabe.first + " " + wannabe.last}
                                    />
                                </a>
                                <div className="friends-name-button">
                                    <a href={"/user/" + wannabe.id}>
                                        {wannabe.first} {wannabe.last}
                                    </a>
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

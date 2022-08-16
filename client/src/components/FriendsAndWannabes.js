//this component needs a bit of state -> function component
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    acceptFriend,
    rejectFriend,
    receiveFriendsAndWannabes,
} from "../redux/friends/slice.js";

export default function FriendsAndWannabes() {
    const dispatch = useDispatch();
    //very important to define the following two variables: they allow the DOM to react to changes in Redux data

    //first case of useSelector - if there is friends data, give back the ones with accepted false (wannabes)
    //be careful about not messing up the arrow function state => ..., it needs to return smth
    const wannabes = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => !friend.accepted)
    );
    console.log("wannabes from the global state", wannabes);
    //second case useSelector - if there is friends data, give back the ones with accepted true (friends)
    const friends = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => friend.accepted)
    );
    console.log("friends from the global state", friends);

    //handle accept function - accept a single user

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

    useEffect(() => {
        //note the argument of useEffect: do this just once on mount, the rest of the state will be handled by Redux!

        //the condition below ensures we don't talk to the database needlessly
        if (friends.length == 0 || wannabes.length == 0) {
            (async () => {
                try {
                    const res = await fetch("/api/friends");
                    const data = await res.json();
                    console.log(
                        "data after fetch friends and wannabes",
                        data.friends
                    );
                    //data is 1. array of objects when there is data; 2. empty array for 0 friends; 3. a message if there was an error

                    //exclude cases when there is no data or when there was an error
                    if (data.length !== 0 || !data.message) {
                        // pass data from server to redux; redux will update our data because we use useSelector;
                        // console.log("sending data to redux");
                        //careful about the type of data being sent - wrapping it in an object or not
                        dispatch(receiveFriendsAndWannabes(data.friends));
                    }
                } catch (err) {
                    //TO DO: handle error here
                    console.log("error in fetch friends", err);
                }
            })();
        }
    }, []);

    //return something while we wait for the fetch above
    if (friends.length == 0 || wannabes.length == 0) {
        return null;
    }

    return (
        <>
            <section className="friends">
                <h3>Friend requests:</h3>
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
                                            alt={
                                                wannabe.first +
                                                " " +
                                                wannabe.last
                                            }
                                        />
                                    </a>
                                    <div className="friends-name-button">
                                        <a href={"/user/" + wannabe.id}>
                                            {wannabe.first} {wannabe.last}
                                        </a>
                                        <button
                                            className="friend-button"
                                            onClick={() =>
                                                handleAccept(wannabe.id)
                                            }
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

                <hr></hr>
                <h3>Friends:</h3>
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
                                            alt={
                                                friend.first + " " + friend.last
                                            }
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
            </section>
        </>
    );
}

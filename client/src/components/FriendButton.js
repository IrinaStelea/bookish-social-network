import { useParams } from "react-router";
import { useState, useEffect } from "react";

export default function FriendButton() {
    const { id } = useParams();
    const [button, setButton] = useState({
        text: "Send friend request",
        url: "/addfriend",
    });

    // const [friendMode, setFriendMode] = useState({
    //     hasRequest: false,
    //     accepted: false,
    //     isMyRequest: false,
    // });

    //fetch friendship status on mount
    useEffect(() => {
        console.log("the id is", id);
        fetch(`/api/friendship/${id}`)
            .then((resp) => resp.json())
            .then((data) => {
                console.log("data after fetch user data in FriendButton", data);
                let newState = handleResponse(data);
                console.log("new state", newState);
                setButton(newState);
            })
            .catch((err) => {
                //TO DO: handle error here
                console.log("error in fetch request FriendButton", err);
            });
    }, []);

    const handleResponse = (data) => {
        let button = {};
        if (data.length == 0) {
            button.text = "Send friend request";
            button.url = "/friendshiprequest";
            console.log("button value changed");
        } else if (!data[0].accepted && data[0].sender_id == id) {
            button.text = "Accept friend request";
            button.url = "/acceptfriendship";
            console.log("button value changed");
        } else if (!data[0].accepted && data[0].recipient_id == id) {
            button.text = "Cancel friend request";
            button.url = "/cancelfriendship";
            console.log("button value changed");
        } else if (data[0].accepted) {
            button.text = "Unfriend";
            button.url = "/cancelfriendship";
            console.log("button value changed");
        }

        return button;
    };

    const handleClick = () => {
        console.log("click on the button");
        fetch(`${button.url}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
            .then((resp) => resp.json())
            .then((data) => {
                console.log("data after button click");
                let newState = handleResponse(data);
                console.log("new state", newState);
                setButton(newState);
            })
            .catch((err) => {
                console.log("error in changing friendship status", err);
            });
    };

    return (
        <>
            <button onClick={handleClick}>{button.text}</button>
        </>
    );
}

// old version: button logic for what it should display based on the three states

// {
//     button.hasRequest ? (
//         button.accepted ? (
//             <button onClick={(unfriend) => handleClick(unfriend)}>
//                 Unfriend
//             </button>
//         ) : button.isMyRequest ? (
//             <button onClick={handleClick}>Cancel request</button>
//         ) : (
//             <button onClick={handleClick}>Accept request</button>
//         )
//     ) : (
//         <button onClick={handleClick}>Send request</button>
//     );
// }

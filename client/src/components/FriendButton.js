import { useParams } from "react-router";
import { useState, useEffect } from "react";

export default function FriendButton() {
    const { id } = useParams();
    const [button, setButton] = useState({
        text: "Send request",
        url: "/addfriend",
        class: "friend-button",
    });
    //button for rejecting
    const rejectButton = {
        text: "Decline request",
        url: "/cancelfriendship",
    };
    const [error, setError] = useState({});

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
                console.log("new state equals false", newState === false);
                //separating error from new button state
                if (Object.keys(newState).length) {
                    setButton(newState);
                }
            })
            .catch((err) => {
                //TO DO: handle error here
                console.log("error in fetch request FriendButton", err);
            });
    }, []);

    const handleResponse = (data) => {
        let button = {};
        if (data.message) {
            console.log(data.message);
            setError(data);
        } else if (data.length == 0) {
            button.text = "Send request";
            button.url = "/friendshiprequest";
            button.class = "friend-button";
            console.log("button value changed");
        } else if (!data[0].accepted && data[0].sender_id == id) {
            button.text = "Add as friend";
            button.url = "/acceptfriendship";
            button.class = "friend-button";
            console.log("button value changed");
        } else if (!data[0].accepted && data[0].recipient_id == id) {
            button.text = "Cancel request";
            button.url = "/cancelfriendship";
            button.class = "unfriend";
            console.log("button value changed");
        } else if (data[0].accepted) {
            button.text = "Unfriend";
            button.url = "/cancelfriendship";
            button.class = "unfriend";
            console.log("button value changed");
        }

        return button;
    };

    const handleClick = (url) => {
        console.log("click on the button");
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
            .then((resp) => resp.json())
            .then((data) => {
                console.log("data after button click");
                let newState = handleResponse(data);
                console.log("new state", newState);
                //separating error from new button state
                if (Object.keys(newState).length) {
                    setButton(newState);
                }
            })
            .catch((err) => {
                console.log("error in changing friendship status", err);
            });
    };

    return (
        <>
            <button
                className={button.class}
                onClick={() => handleClick(button.url)}
            >
                {button.text}
            </button>
            {button.text == "Add as friend" && (
                <button
                    className="deny-friend-button"
                    onClick={() => handleClick(rejectButton.url)}
                >
                    {rejectButton.text}
                </button>
            )}
            {error.message && (
                <p className="error error-button">{error.message}</p>
            )}
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

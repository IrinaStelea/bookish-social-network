import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { socket } from "../socket";

export default function FriendButton({ userid }) {
    //define the id dynamically - if the id gets passed from the OtherUserProfile-Friends or from the params (usage on OtherUserProfile)
    const id = userid || useParams().id;

    const [button, setButton] = useState({
        text: "Send request",
        url: "/addfriend",
        class: "friend-button",
    });
    const rejectButton = {
        text: "Do not add",
        url: "/cancelfriendship",
    };
    const [error, setError] = useState({});

    const userData = useSelector((state) => state.userData);

    const handleResponse = (data) => {
        let button = {};
        if (data.message) {
            setError(data);
        } else if (data.length == 0) {
            button.text = "Send request";
            button.url = "/friendshiprequest";
            button.class = "friend-button";
        } else if (!data[0].accepted && data[0].sender_id == id) {
            button.text = "Add as friend";
            button.url = "/acceptfriendship";
            button.class = "friend-button";
        } else if (!data[0].accepted && data[0].recipient_id == id) {
            button.text = "Cancel request";
            button.url = "/cancelfriendship";
            button.class = "unfriend";
        } else if (data[0].accepted) {
            button.text = "Unfriend";
            button.url = "/cancelfriendship";
            button.class = "unfriend";
        }
        return button;
    };

    const handleButtonClick = (url) => {
        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        })
            .then((resp) => resp.json())
            .then((data) => {
                //emit message to socket, checking if it was a friendship request or a request cancellation
                if (
                    data[0] &&
                    data[0].recipient_id &&
                    data[0].sender_id &&
                    data[0].accepted == false
                ) {
                    socket.emit("new-friend-request", {
                        recipient_id: data[0].recipient_id,
                        sender_id: data[0].sender_id,
                    });
                }

                if (!data.length) {
                    socket.emit("new-friend-cancel", {
                        recipient_id: id,
                        sender_id: userData.id,
                    });
                }

                //set the new button state, excluding error cases
                let newState = handleResponse(data);
                if (Object.keys(newState).length) {
                    setButton(newState);
                }
            })
            .catch((err) => {
                console.log("error in changing friendship status", err);
            });
    };

    //fetch friendship status on button mount
    useEffect(() => {
        fetch(`/api/friendship/${id}`)
            .then((resp) => resp.json())
            .then((data) => {
                let newState = handleResponse(data);
                //separating error from new button state
                if (Object.keys(newState).length) {
                    setButton(newState);
                }
            })
            .catch((err) => {
                console.log("error in fetch request FriendButton", err);
            });
    }, []);

    return (
        <>
            <button
                className={button.class}
                onClick={() => handleButtonClick(button.url)}
            >
                {button.text}
            </button>
            {button.text == "Add as friend" && (
                <button
                    className="deny-friend-button"
                    onClick={() => handleButtonClick(rejectButton.url)}
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

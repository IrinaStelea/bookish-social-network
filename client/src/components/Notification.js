import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "../css/MainStylesheet.css";

export default function NotificationUserOnline() {
    const userJoinedNotification = useSelector(
        (state) => state.userJoinedNotification
    );
    const friends = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => friend.accepted)
    );
    const [notification, setNotification] = useState(false);

    useEffect(() => {
        if (!Object.keys(userJoinedNotification).length) {
            return;
        }
        //show the notification only if the two are friends
        if (
            friends.filter((friend) => friend.id === userJoinedNotification.id)
                .length
        ) {
            setNotification(true);
            setTimeout(() => {
                setNotification(false);
            }, 5000);
        }
    }, [userJoinedNotification]);

    return (
        <>
            {notification && (
                <span className="newuser-notify">
                    {userJoinedNotification.first} is online
                </span>
            )}
        </>
    );
}

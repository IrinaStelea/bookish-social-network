import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "../css/MainStylesheet.css";

export default function NotificationUserOnline() {
    const userJoinedFirst = useSelector((state) => state.userJoined);
    const [notification, setNotification] = useState(false);

    const toggleNotification = () => {
        setNotification(true);
    };

    const hideNotification = () => {
        setTimeout(() => {
            setNotification(false);
        }, 3000);
    };

    useEffect(() => {
        if (userJoinedFirst) {
            toggleNotification();
            hideNotification();
        }
    }, [userJoinedFirst]);

    return (
        <>
            {notification && (
                <span className="newuser-notify">
                    {userJoinedFirst} is online
                </span>
            )}
        </>
    );
}

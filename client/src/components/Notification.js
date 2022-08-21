import "./Registration.css";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function Notification() {
    const userJoinedFirst = useSelector((state) => state.userJoined);

    // console.log("user joined first", userJoinedFirst);

    const [notification, setNotification] = useState(false);

    const toggleNotification = () => {
        setNotification(true);
    };

    const hideNotification = () => {
        console.log("inside hide notification");
        setTimeout(() => {
            console.log("inside time out");
            setNotification(false);
        }, 3000);
    };

    useEffect(() => {
        if (userJoinedFirst) {
            console.log("calling toggle notification");
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

export default function UserJoinedNotificationReducer(userJoined = "", action) {
    if (action.type === "online-user/notify") {
        //set the friends on the global state based on the payload
        userJoined = action.payload;
        // console.log("userJoined in main reducer", userJoined);
    }

    return userJoined;
}

export function onlineUserNotify(userJoined) {
    return {
        type: "online-user/notify",
        payload: userJoined,
    };
}

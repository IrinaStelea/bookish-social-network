export default function UserJoinedNotificationReducer(userJoined = "", action) {
    if (action.type === "online-user/notify") {
        userJoined = action.payload;
    }
    return userJoined;
}

export function onlineUserNotify(userJoined) {
    return {
        type: "online-user/notify",
        payload: userJoined,
    };
}

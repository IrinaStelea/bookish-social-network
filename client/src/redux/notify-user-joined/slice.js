export default function UserJoinedNotificationReducer(userJoinedNotification = {}, action) {
    if (action.type === "online-user/notify") {
        userJoinedNotification = action.payload;
    }
    return userJoinedNotification;
}

export function onlineUserNotify(user) {
    return {
        type: "online-user/notify",
        payload: user,
    };
}

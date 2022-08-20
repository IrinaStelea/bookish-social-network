/* eslint-disable indent */
export default function OnlineUsersReducer(onlineUsers = [], action) {
    switch (action.type) {
        case "/online-users/received":
            console.log("online users", action.payload);
            return action.payload;
        case "/online-user/joined":
            return [action.payload, ...onlineUsers];
        case "/online-user/left":
            return onlineUsers.filter((user) => user.id !== action.payload.id);
        default:
            return onlineUsers;
    }
}

export function onlineUsersReceived(users) {
    return {
        type: "/online-users/received",
        payload: users,
    };
}

export function onlineUserJoined(user) {
    return {
        type: "/online-user/joined",
        payload: user,
    };
}

export function onlineUserLeft(user) {
    return {
        type: "/online-user/left",
        payload: user,
    };
}

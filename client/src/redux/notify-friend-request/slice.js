export default function NotifyFriendRequestReducer(requests = [], action) {
    if (action.type === "friend-request/receive") {
        return action.payload;
    }

    if (action.type === "friend-request/notify") {
        // console.log(
        //     "sender id in friend request  main reducer",
        //     action.payload
        // );
        return [...requests, action.payload];
    }

    if (action.type === "friend-request/reset") {
        console.log("mini reducer friend request", action.payload);
        return action.payload;
    }

    if (action.type === "friend-request/cancel") {
        console.log("friend request cancel", action.payload);
        return requests.filter((request) => request !== action.payload);
    }

    return requests;
}

export function receiveFriendRequests(requests) {
    return {
        type: "friend-request/receive",
        payload: requests,
    };
}

export function friendRequestNotify(id) {
    return {
        type: "friend-request/notify",
        payload: id,
    };
}

export function friendRequestCancel(id) {
    return {
        type: "friend-request/cancel",
        payload: id,
    };
}

export function resetFriendRequests(id = null) {
    return {
        type: "friend-request/reset",
        payload: id,
    };
}

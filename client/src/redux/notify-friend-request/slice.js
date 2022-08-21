export default function NotifyFriendRequestReducer(requests = [], action) {
    if (action.type === "friend-request/notify") {
        // console.log(
        //     "sender id in friend request  main reducer",
        //     action.payload
        // );
        return [...requests, action.payload];
    }

    if (action.type === "friend-request/reset") {
        console.log("mini reducer friend request", action.payload);
        // action.payload
        //     ? requests.filter((request) => request !== action.payload)
        //     : (requests = []);
    }

    return requests;
}

export function friendRequestNotify(id) {
    return {
        type: "friend-request/notify",
        payload: id,
    };
}

export function resetFriendRequests(id = null) {
    return {
        type: "friend-request/reset",
        payload: id,
    };
}

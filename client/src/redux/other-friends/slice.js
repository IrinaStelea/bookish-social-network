export default function OtherFriendsReducer(otherFriends = [], action) {
    if (action.type === "other-friends/receive") {
        //set the friends on the global state based on the payload
        otherFriends = action.payload.friends;
        console.log("other friends in main reducer", otherFriends);
    }

    return otherFriends;
}

//action for other friends (when visiting other profile pages)
export function receiveOtherFriends(friends) {
    return {
        type: "other-friends/receive",
        payload: { friends },
    };
}

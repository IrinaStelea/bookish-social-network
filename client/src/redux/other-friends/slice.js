export default function OtherUserFriendsReducer(otherUserFriends = [], action) {
    if (action.type === "other-user-friends/receive") {
        //set the friends on the global state based on the payload
        otherUserFriends = action.payload.friends;
        console.log("other friends in main reducer", otherUserFriends);
    }

    return otherUserFriends;
}

//action for other friends (when visiting other profile pages)
export function receiveOtherUserFriends(friends) {
    return {
        type: "other-user-friends/receive",
        payload: { friends },
    };
}

export default function OtherUserFriendsReducer(otherUserFriends = [], action) {
    if (action.type === "other-user-friends/receive") {
        otherUserFriends = action.payload.friends;
    }
    return otherUserFriends;
}
export function receiveOtherUserFriends(friends) {
    return {
        type: "other-user-friends/receive",
        payload: { friends },
    };
}

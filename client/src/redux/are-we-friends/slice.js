export default function AreWeFriendsReducer(areWeFriends = false, action) {
    if (action.type === "are-we-friends") {
        areWeFriends = action.payload.areWeFriends;
    }

    return areWeFriends;
}

export function receiveAreWeFriends(areWeFriends) {
    return {
        type: "are-we-friends",
        payload: { areWeFriends },
    };
}

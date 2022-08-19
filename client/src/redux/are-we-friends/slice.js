export default function AreWeFriendsReducer(areWeFriends = false, action) {
    if (action.type === "other-friends/are-we-friends") {
        //set the friends on the global state based on the payload
        areWeFriends = action.payload.areWeFriends;
        console.log("are we friends in main reducer", areWeFriends);
    }

    return areWeFriends;
}

export function receiveAreWeFriends(areWeFriends) {
    return {
        type: "other-friends/are-we-friends",
        payload: { areWeFriends },
    };
}

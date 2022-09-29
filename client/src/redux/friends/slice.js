export default function FriendsAndWannabesReducer(friends = [], action) {
    if (action.type === "friends-and-wannabes/received") {
        friends = action.payload.friends;
    }

    if (action.type === "friends-and-wannabes/accept") {
        friends = friends.map((friend) => {
            if (friend.id == action.payload.id) {
                return { ...friend, accepted: true };
            } else {
                return friend;
            }
        });
    }

    if (action.type === "friends-and-wannabes/unfriend") {
        friends = friends.filter((friend) => friend.id !== action.payload.id);
    }
    return friends;
}

export function receiveFriendsAndWannabes(friends) {
    return {
        type: "friends-and-wannabes/received",
        payload: { friends },
    };
}

export function acceptFriend(id) {
    return {
        type: "friends-and-wannabes/accept",
        payload: { id },
    };
}

export function rejectFriend(id) {
    return {
        type: "friends-and-wannabes/unfriend",
        payload: { id },
    };
}

//need three conditions to deal with 3 different types of actions +++ 3 action creators

//1.friends-and-wannabes/received - sets state to be the list of friends and wannabes we receive from the server

//2.friends-and-wannabes/accept - accept one friend, map(), the payload is the id of the friend we are accepting

//3.friends-and-wannabes/unfriend - accept one friend, filter(), the payload is the id of the friend we are unfriending

export default function FriendsAndWannabesReducer(friends = [], action) {
    if (action.type === "friends-and-wannabes/received") {
        //set the friends on the global state based on the payload
        friends = action.payload.friends;
        console.log("friends in main reducer", friends);
    }

    if (action.type === "friends-and-wannabes/accept") {
        //loop through all the friends, find the one with the particular id equal to the payload id
        friends = friends.map((friend) => {
            console.log("friend id is", friend.id);
            if (friend.id == action.payload.id) {
                //altering just that specific friend
                return { ...friend, accepted: true };
            } else {
                //leave the other characters intact
                return friend;
            }
        });
    }

    if (action.type === "friends-and-wannabes/unfriend") {
        //loop through all the friends, find the one with the particular id equal to the payload id and remove that friend - use filter
        friends = friends.filter((friend) => friend.id !== action.payload.id);
    }

    //return friends only at the end
    return friends;
}

//action for receiving friends; wrap the payload in an object with a friends property
export function receiveFriendsAndWannabes(friends) {
    return {
        type: "friends-and-wannabes/received",
        payload: { friends }, //this is destructuring
    };
}

//action for making a friend
//call this function in our component when the user clicks on the button, pass in the id, it will return the action object, then dispatch to redux
export function acceptFriend(id) {
    return {
        type: "friends-and-wannabes/accept",
        payload: { id },
    };
}

//action for unfriending
export function rejectFriend(id) {
    return {
        type: "friends-and-wannabes/unfriend",
        payload: { id },
    };
}

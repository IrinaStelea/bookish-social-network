import { combineReducers } from "redux";

//imoprt friendsAndWannabesReducer
import FriendsAndWannabesReducer from "./friends/slice";
import MessagesReducer from "./messages/slice";
import OtherFriendsReducer from "./other-friends/slice";
import AreWeFriendsReducer from "./are-we-friends/slice";
import OnlineUsersReducer from "./online-users/slice";
import UserJoinedNotificationReducer from "./notify-user-joined/slice";
import NotifyFriendRequestReducer from "./notify-friend-request/slice";

//this represents our global state - in our global state we want a property called friends which is what the mini-reducer returns (in this case an object with a friends key and a property that is an array of objects (the friends/wannabes))

//extend the global state to include the messages
const rootReducer = combineReducers({
    friends: FriendsAndWannabesReducer,
    messages: MessagesReducer,
    otherFriends: OtherFriendsReducer,
    areWeFriends: AreWeFriendsReducer,
    onlineUsers: OnlineUsersReducer,
    userJoined: UserJoinedNotificationReducer,
    requests: NotifyFriendRequestReducer,
});

export default rootReducer;

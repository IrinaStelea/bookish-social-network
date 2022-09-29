import { combineReducers } from "redux";

import FriendsAndWannabesReducer from "./friends/slice";
import MessagesReducer from "./messages/slice";
import OtherUserFriendsReducer from "./other-friends/slice";
import AreWeFriendsReducer from "./are-we-friends/slice";
import OnlineUsersReducer from "./online-users/slice";
import UserJoinedNotificationReducer from "./notify-user-joined/slice";
import NotifyFriendRequestReducer from "./notify-friend-request/slice";
import UserDataReducer from "./userdata/slice";

const rootReducer = combineReducers({
    friends: FriendsAndWannabesReducer,
    messages: MessagesReducer,
    otherUserFriends: OtherUserFriendsReducer,
    areWeFriends: AreWeFriendsReducer,
    onlineUsers: OnlineUsersReducer,
    userJoined: UserJoinedNotificationReducer,
    requests: NotifyFriendRequestReducer,
    userData: UserDataReducer,
});

export default rootReducer;

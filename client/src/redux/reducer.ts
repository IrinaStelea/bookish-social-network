import { combineReducers } from "redux";

import FriendsAndWannabesReducer from "./friends/slice";
import MessagesReducer from "./messages/slice";
import OtherUserFriendsReducer from "./other-friends/slice";
import AreWeFriendsReducer from "./are-we-friends/slice";
import OnlineUsersReducer from "./online-users/slice";
import UserJoinedNotificationReducer from "./notify-user-joined/slice";
import NotifyFriendRequestReducer from "./notify-friend-request/slice";
import UserDataReducer from "./userdata/slice";
import WallPostsReducer from "./wallposts/slice";

export interface ReduxStore {
    wallPosts: ReturnType<typeof WallPostsReducer>;
}

const rootReducer = combineReducers({
    friends: FriendsAndWannabesReducer,
    messages: MessagesReducer,
    otherUserFriends: OtherUserFriendsReducer,
    areWeFriends: AreWeFriendsReducer,
    onlineUsers: OnlineUsersReducer,
    userJoinedNotification: UserJoinedNotificationReducer,
    requests: NotifyFriendRequestReducer,
    userData: UserDataReducer,
    wallPosts: WallPostsReducer,
});

export default rootReducer;

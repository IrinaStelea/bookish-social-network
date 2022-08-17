import { combineReducers } from "redux";

//imoprt friendsAndWannabesReducer
import FriendsAndWannabesReducer from "./friends/slice";
import MessagesReducer from "./messages/slice";

//this represents our global state - in our global state we want a property called friends which is what the mini-reducer returns (in this case an object with a friends key and a property that is an array of objects (the friends/wannabes))

//extend the global state to include the messages
const rootReducer = combineReducers({
    friends: FriendsAndWannabesReducer,
    messages: MessagesReducer,
});

export default rootReducer;

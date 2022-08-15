import { combineReducers } from "redux";

//imoprt friendsAndWannabesReducer
import FriendsAndWannabesReducer from "./friends/slice";

//this represents our global state - in our global state we want a property called friends which is wha the mini-reducer returns (in this case an object with a friends key and a property that is an array of objects (the friends/wannabes))
const rootReducer = combineReducers({
    friends: FriendsAndWannabesReducer,
});

export default rootReducer;

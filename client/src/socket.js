//socket-relevant code on the client side
import { messagesReceived, messageReceived } from "./redux/messages/slice.js";
import { onlineUserNotify } from "./redux/notify-user-joined/slice.js";
import {
    onlineUsersReceived,
    onlineUserJoined,
    onlineUserLeft,
} from "./redux/online-users/slice.js";
import { friendRequestNotify } from "./redux/notify-friend-request/slice.js";
import { friendRequestCancel } from "./redux/notify-friend-request/slice.js";
import { receiveFriendRequests } from "./redux/notify-friend-request/slice";
import { io } from "socket.io-client";

//export a socket variable to be used in the ChatInput component
export let socket;

//initialise the socket to be able to use it on the client side
//in the init function, the store is passed as parameter -> the socket will talk to the store to pass data to change the store
export const init = (store) => {
    if (!socket) {
        //assign the socket connection to the socket variable in case socket is undefined -> this ensures that we initialise the socket only once, otherwise it would keep opening connections
        socket = io.connect();

        socket.on("last-10-messages", (messages) => {
            //messages should be an array of objects
            // console.log("got last 10 messages:", messages);
            store.dispatch(messagesReceived(messages));
        });

        socket.on("number-of-friend-requests", (data) => {
            //messages should be an array of objects
            // console.log("got last 10 messages:", messages);
            store.dispatch(receiveFriendRequests(data));
        });

        //listening to when a new message was just added to the database via the server socket that emits an event for this
        socket.on("added-new-message", (message) => {
            // console.log("the latest message is:", message);
            store.dispatch(messageReceived(message));
        });

        //listening to the list of online users emitted by the server
        socket.on("online-users", (users) => {
            // console.log("the latest message is:", message);
            store.dispatch(onlineUsersReceived(users));
        });

        //listening to new user joined online
        socket.on("user-joined", (user) => {
            // console.log("the latest message is:", message);
            store.dispatch(onlineUserJoined(user));
            store.dispatch(onlineUserNotify(user.first));
        });

        //listening to new friend notification
        socket.on("new-friend-notification", (data) => {
            console.log("data in listen new friend notification", data);
            store.dispatch(friendRequestNotify(data.sender_id));
        });

        //listening to cancel friend request
        socket.on("new-friend-request-cancel", (data) => {
            console.log("data in cancel new friend request", data);
            store.dispatch(friendRequestCancel(data.sender_id));
        });

        //listening to user left
        socket.on("user-left", (user) => {
            // console.log("the latest message is:", message);
            store.dispatch(onlineUserLeft(user));
        });
    }
};

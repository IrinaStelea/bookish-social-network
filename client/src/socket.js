import { io } from "socket.io-client";
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

export let socket;

//initialise the socket to use it on the client side
export const init = (store) => {
    if (!socket) {
        socket = io.connect();

        socket.on("last-10-messages", (messages) => {
            store.dispatch(messagesReceived(messages));
        });

        //listening to newly added general chat message
        socket.on("added-new-message", (message) => {
            store.dispatch(messageReceived(message));
        });

        //listening to the list of online users emitted by the server
        socket.on("online-users", (users) => {
            store.dispatch(onlineUsersReceived(users));
        });

        //listening to new user joined online
        socket.on("user-joined", (user) => {
            store.dispatch(onlineUserJoined(user));
            store.dispatch(onlineUserNotify(user.first));
        });

        //listening to the nb of friend request notifications
        socket.on("number-of-friend-requests", (data) => {
            store.dispatch(receiveFriendRequests(data));
        });

        //listening to new friend request notification
        socket.on("new-friend-notification", (data) => {
            store.dispatch(friendRequestNotify(data.sender_id));
        });

        //listening to cancel friend request notification
        socket.on("new-friend-request-cancel", (data) => {
            store.dispatch(friendRequestCancel(data.sender_id));
        });

        //listening to user disconnected
        socket.on("user-left", (user) => {
            store.dispatch(onlineUserLeft(user));
        });
    }
};

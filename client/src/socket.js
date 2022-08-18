//socket-relevant code on the client side
import { messagesReceived, messageReceived } from "./redux/messages/slice.js";
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

        //listening to when a new message was just added to the database via the server socket that emits an event for this
        socket.on("added-new-message", (message) => {
            // console.log("the latest message is:", message);
            store.dispatch(messageReceived(message));
        });
    }
};

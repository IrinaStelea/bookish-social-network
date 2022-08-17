/* eslint-disable indent */
export default function MessagesReducer(messages = [], action) {
    switch (action.type) {
        case "/messages/received":
            console.log("messages received in messagesReducer", action.payload);
            return action.payload; //overwrite the existing state with the new messages we got from the dispatch of the action
        case "/message/received":
            return [action.payload, ...messages];
        //OR return [...messages].push(action.payload);
        // return [...messages].unshift(); //important to deconstruct otherwise we overwrite the original array
        default:
            return messages;
    }
}

export function messagesReceived(messages) {
    return {
        type: "/messages/received",
        payload: messages, //aim to provide an array of objects rather than wrapping it in a messages property
    };
}

export function messageReceived(message) {
    return {
        type: "/message/received",
        payload: message, //provide a message object, do not wrap it in a message property
    };
}

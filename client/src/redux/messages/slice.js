/* eslint-disable indent */
export default function MessagesReducer(messages = [], action) {
    switch (action.type) {
        case "/messages/received":
            return action.payload;
        case "/message/received":
            return [action.payload, ...messages];
        default:
            return messages;
    }
}

export function messagesReceived(messages) {
    return {
        type: "/messages/received",
        payload: messages,
    };
}

export function messageReceived(message) {
    return {
        type: "/message/received",
        payload: message,
    };
}

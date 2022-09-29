export default function UserDataReducer(userData = {}, action) {
    if (action.type === "user-data/receive") {
        userData = action.payload;
    }

    return userData;
}

export function userDataReceive(userData) {
    return {
        type: "user-data/receive",
        payload: userData,
    };
}

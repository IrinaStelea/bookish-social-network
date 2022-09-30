/* eslint-disable indent */
import { WallPost } from "../../types";

export default function WallPostsReducer(
    wallPosts: WallPost[] = [],
    action: any
): WallPost[] {
    switch (action.type) {
        case "/wallposts/received":
            return action.payload;
        case "/wallpost/received":
            return [action.payload, ...wallPosts];
        default:
            return wallPosts;
    }
}

export function wallPostsReceived(wallPosts: WallPost[]) {
    return {
        type: "/wallposts/received",
        payload: wallPosts,
    };
}

export function wallPostReceived(wallPost: WallPost) {
    return {
        type: "/wallpost/received",
        payload: wallPost,
    };
}

import React, { useRef, useEffect } from "react";
// import { useSelector } from "react-redux";
import { useParams } from "react-router";
// import { ReduxStore } from "../../redux/reducer";
import { Link } from "react-router-dom";
import { socket } from "../../socket.js";
import { WallPost } from "../../types";

interface WallPostProps {
    wallPosts: WallPost[];
}

export default function Wall(props: WallPostProps) {
    const { id } = useParams<{ id: string }>();
    // const wallPosts = useSelector((state: ReduxStore) => state.wallPosts);
    const textareaRef = useRef<HTMLTextAreaElement>();
    // const wallRef = useRef<HTMLDivElement>();

    const sendWallPost = () => {
        if (textareaRef.current) {
            const wallPost = textareaRef.current.value;
            //TO DO: socket emits when there is a new wall post
            socket.emit("new-wall-post", {
                text: wallPost,
                id: id || null,
            });

            //clear the textarea and keep the focus on it
            textareaRef.current.value = "";
            textareaRef.current.focus();
        }
    };

    //submit wall post when clicking Enter
    const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            sendWallPost();
        }
    };

    //TO DO: wall posts should appear in reverse chronological order

    return (
        <>
            {props.wallPosts.length !== 0 ? (
                <div className="wall-container">
                    {props.wallPosts.map((post: WallPost) => (
                        <div className="wall-cell" key={post.id}>
                            <Link to={"/user/" + post.sender_id}>
                                <img
                                    src={
                                        post.avatarurl || "../../no_avatar.png"
                                    }
                                    alt={post.first + " " + post.last}
                                />
                            </Link>
                            <div className="wall-post">
                                <p>{post.post}</p>
                                <p>
                                    Posted by{" "}
                                    <Link to={"/user/" + post.sender_id}>
                                        {post.first} {post.last}
                                    </Link>{" "}
                                    on{" "}
                                    {post.timestamp
                                        .slice(0, 10)
                                        .split("-")
                                        .reverse()
                                        .join("-")}{" "}
                                    at {post.timestamp.slice(11, 19)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Be the first to add a wall post.</p>
            )}
            <div className="wall-input">
                <textarea
                    cols={40} //note brackets to conform to type "number"
                    rows={6}
                    ref={textareaRef}
                    placeholder="Write a wall post"
                    onKeyUp={onKeyUp}
                ></textarea>
                <button onClick={sendWallPost}>Post</button>
            </div>
        </>
    );
}

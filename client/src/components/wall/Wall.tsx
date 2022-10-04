import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { WallPost } from "../../types";
import { wallPostReceived } from "../../redux/wallposts/slice";

interface WallPostProps {
    wallPosts: WallPost[];
}

export default function Wall(props: WallPostProps) {
    const dispatch = useDispatch();
    const { id } = useParams<{ id: string }>();
    const [error, setError] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>();

    const sendWallPost = async () => {
        if (textareaRef.current) {
            try {
                const wallPost = textareaRef.current.value;

                const res = await fetch("/api/new-wall-post", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ text: wallPost, id: id || null }),
                });
                const data = await res.json();
                if (data.success) {
                    //if this is the user's own wall, add post to store
                    if (!id) {
                        dispatch(wallPostReceived(data.wallPost));
                    }
                    //clear the textarea and keep the focus on it
                    textareaRef.current.value = "";
                    textareaRef.current.focus();
                } else {
                    setError("Something went wrong, please try again");
                }
            } catch (err) {
                console.log("error in adding new message", err);
                setError("Something went wrong, please try again");
            }
        }
    };

    //submit wall post when clicking Enter
    const onKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.keyCode == 13 && !e.shiftKey) {
            sendWallPost();
        }
    };

    return (
        <>
            {error && <p className="error">{error}</p>}
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
                            <div className="wall-post-header">
                                <p>
                                    <Link to={"/user/" + post.sender_id}>
                                        {post.first} {post.last}
                                    </Link>{" "}
                                </p>
                                <p>
                                    {post.timestamp
                                        .slice(0, 10)
                                        .split("-")
                                        .reverse()
                                        .join("-")}{" "}
                                    at {post.timestamp.slice(11, 19)}
                                </p>
                            </div>
                            <div className="wall-post">
                                <p>{post.post}</p>
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

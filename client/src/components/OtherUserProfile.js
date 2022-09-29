import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import FriendButton from "./FriendButton";
import OtherUserFriends from "./OtherUserProfile-Friends";
import { receiveOtherUserFriends } from "../redux/other-friends/slice";
import { receiveAreWeFriends } from "../redux/are-we-friends/slice";

export default function OtherProfile() {
    const dispatch = useDispatch();
    const { id } = useParams(); //grab ID in URL from params
    const history = useHistory();
    const [user, setUser] = useState({});

    //get friends of viewed user
    const otherUserFriends = useSelector((state) => state.otherUserFriends);
    const areWeFriends = useSelector((state) => state.areWeFriends);

    //fetch profile info of viewed user
    useEffect(() => {
        fetch(`/api/user/${id}`)
            .then((resp) => resp.json())
            .then((data) => {
                if (!data.success) {
                    //for edge cases, redirect the user away using the history object from the React Router
                    history.push("/");
                } else {
                    setUser(data.profile);
                }
            })
            .catch((err) => {
                console.log("error in fetch request OtherUserProfile", err);
            });
        //note it is necessary to watch the id because the profile might not be available as soon as the component mounts
    }, [id]);

    //fetch friends of viewed user
    useEffect(() => {
        if (otherUserFriends.length == 0) {
            (async () => {
                try {
                    const res = await fetch(`/api/otheruserfriends/${id}`);
                    const data = await res.json();
                    //pass data to redux only if user & viewed user are friends
                    if (data.areWeFriends) {
                        dispatch(receiveOtherUserFriends(data.friends));
                        dispatch(receiveAreWeFriends(data.areWeFriends));
                    }
                } catch (err) {
                    console.log("error in fetch other user's friends", err);
                }
            })();
        }
    }, [id]);

    return (
        <>
            <div className="profile-container">
                <div className="name-bio-container">
                    <img
                        id="avatar"
                        src={user.avatarurl || "../../no_avatar.png"}
                        alt={user.first + " " + user.last}
                    />
                    <FriendButton />
                </div>
                <div className="name-bio-container">
                    <h3>
                        {user.first} {user.last}
                    </h3>
                    <p id="bio">{user.bio || "No bio yet"}</p>
                </div>
            </div>
            {areWeFriends && (
                <div className="friends">
                    <h3>Friends of {user.first}</h3>
                    <OtherUserFriends
                        otherUserFriends={otherUserFriends}
                        first={user.first}
                    />
                </div>
            )}
        </>
    );
}

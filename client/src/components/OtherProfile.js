//making a separate component OtherProfile because we cannot repurpose Profile bc OtherProfile needs to make a fetch every time it mounts; also Profile has the BioEditor and Uploader functionalities which are not necessary in OtherProfile

//import useParams hook provided by React to have access to the id
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import FriendButton from "./FriendButton";
import OtherUserFriends from "./OtherProfile-Friends";
import { useSelector, useDispatch } from "react-redux";
import { receiveOtherUserFriends } from "../redux/other-friends/slice";
import { receiveAreWeFriends } from "../redux/are-we-friends/slice";

export default function OtherProfile() {
    //grab ID from params
    const { id } = useParams();
    const history = useHistory();
    const [user, setUser] = useState({});

    //GET USER PROFILE
    useEffect(() => {
        fetch(`/api/user/${id}`)
            .then((resp) => resp.json())
            .then((data) => {
                // console.log("data after fetch user data in OtherProfile", data);
                //handle edge cases
                if (!data.success) {
                    //redirect the user away using the history object from the React Router
                    history.push("/");
                } else {
                    setUser(data.profile);
                }
            })
            .catch((err) => {
                //TO DO: handle error here
                console.log("error in fetch request OtherProfile", err);
            });
        //note it is necessary to watch the id because the profile might not be available as soon as the component mountes
    }, [id]);

    //GET OTHER FRIENDS
    const dispatch = useDispatch();

    const otherUserFriends = useSelector((state) => state.otherUserFriends);
    const areWeFriends = useSelector((state) => state.areWeFriends);
    // console.log(
    //     "other user friends from the global state",
    //     otherUserFriends,
    //     "are we friends",
    //     areWeFriends
    // );

    useEffect(() => {
        if (otherUserFriends.length == 0) {
            (async () => {
                try {
                    const res = await fetch(`/api/otheruserfriends/${id}`);
                    const data = await res.json();
                    // console.log("data after fetch other friends", data.friends);

                    //pass data to redux only if the two are friends
                    if (data.areWeFriends) {
                        dispatch(receiveOtherUserFriends(data.friends));
                        dispatch(receiveAreWeFriends(data.areWeFriends));
                    }
                } catch (err) {
                    //TO DO: handle error here
                    console.log("error in fetch other user friends", err);
                }
            })();
        }
    }, [id]);

    //FIX THIS
    // if (!otherUserFriends) {
    //     return null;
    // }

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

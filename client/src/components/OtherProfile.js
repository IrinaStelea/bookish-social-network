//making a separate component OtherProfile because we cannot repurpose Profile bc OtherProfile needs to make a fetch every time it mounts; also Profile has the BioEditor and Uploader functionalities which are not necessary in OtherProfile

//import useParams hook provided by React to have access to the id
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import FriendButton from "./FriendButton";
import OtherFriends from "./OtherProfile-Friends";
import { useSelector, useDispatch } from "react-redux";
import { receiveOtherFriends } from "../redux/other-friends/slice";

export default function OtherProfile() {
    //grab ID from params
    const { id } = useParams();
    const history = useHistory();
    const [user, setUser] = useState({});
    const [areWeFriends, setAreWeFriends] = useState(false);

    //GET USER PROFILE
    useEffect(() => {
        console.log("the id is", id);
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

    const otherFriends = useSelector((state) => state.otherFriends);
    console.log("other friends from the global state", otherFriends);

    useEffect(() => {
        if (otherFriends.length == 0) {
            (async () => {
                try {
                    // console.log("the id in other profile is", id);
                    const res = await fetch(`/api/otherfriends/${id}`);
                    const data = await res.json();
                    // console.log("data after fetch other friends", data.friends);

                    //exclude cases when there is no data or when there was an error
                    if (data.friends || data.areWeFriends) {
                        // pass data from server to redux; redux will update our data because we use useSelector;
                        // console.log("sending data to redux");
                        //careful about the type of data being sent - wrapping it in an object or not
                        dispatch(receiveOtherFriends(data.friends));
                        //check if we are friends - no longer necessary because data is pre-sorted on the server
                        // if (data.areWeFriends) {
                        //     setAreWeFriends(true);
                        // }
                    }
                } catch (err) {
                    //TO DO: handle error here
                    console.log("error in fetch other friends", err);
                }
            })();
        }
    }, [id]);

    //FIX THIS
    // if (!otherFriends) {
    //     return null;
    // }

    // console.log("are we friends", areWeFriends);

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
            {otherFriends.length !== 0 && (
                <div className="friends">
                    <h3>Friends of {user.first}</h3>
                    <OtherFriends
                        otherFriends={otherFriends}
                        first={user.first}
                    />
                </div>
            )}
        </>
    );
}

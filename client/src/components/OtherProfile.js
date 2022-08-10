//making a separate component OtherProfile because we cannot repurpose Profile bc OtherProfile needs to make a fetch every time it mounts; also Profile has the BioEditor and Uploader functionalities which are not necessary in OtherProfile

//import useParams hook provided by React to have access to the id
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

export default function OtherProfile() {
    //grab ID from params
    const { id } = useParams();
    const history = useHistory();
    // const [first, setFirst] = useState("");
    // const [last, setLast] = useState("");
    // const [avatarUrl, setAvatarUrl] = useState("");
    // const [bio, setBio] = useState("");

    const [user, setUser] = useState({});

    //fetch the user profile when the component mounts
    useEffect(() => {
        console.log("the id is", id);
        fetch(`/api/user/${id}`)
            .then((resp) => resp.json())
            .then((data) => {
                console.log("data after fetch user data in OtherProfile", data);
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

    //fetch info from server - useEffect with sec argument as [id] - watch the user id in case it won't be able to load the profile as soon as it mounts (the info might not be available)
    //render user image (don't use the profile pic component), first & last names, bio - just text
    //edge cases - invalid id (no user found) - show error message OR redirect to home on the client side -> server needs to send a message success false and use useHistory
    //another edge case: or if it's my own profile (but cookie is only available on the server side) - server sends success false and we redirect - compare the id from params with req.session.userId, on the client side we show error message or redirect

    return (
        <>
            <div className="other-profile-container">
                <img
                    src={user.avatarurl || "../../no_avatar.png"}
                    alt={user.first + " " + user.last}
                />
                <div className="name-bio-container">
                    <h3>
                        {user.first} {user.last}
                    </h3>
                    <p>{user.bio || "No bio yet"}</p>
                </div>
            </div>
        </>
    );
}

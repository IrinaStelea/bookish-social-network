// this component holds all the log in info

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { receiveFriendsAndWannabes } from "../redux/friends/slice.js";

import Logo from "./Logo.js";
import Footer from "./Footer.js";
import ProfilePic from "./ProfilePic.js";
import Uploader from "./Uploader.js";
import "./Registration.css";
import Profile from "./Profile.js";
import FindPeople from "./FindPeople.js";
import OtherProfile from "./OtherProfile.js";
import FriendsAndWannabes from "./friends-wannabes/FriendsAndWannabes.js";
import Chat from "./chat/Chat.js";

import {
    BrowserRouter,
    Route,
    NavLink,
    Redirect,
    Switch,
} from "react-router-dom";

export default function App() {
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [bio, setBio] = useState("");
    const [uploaderIsVisible, setUploader] = useState(false);

    //fetch user info once the component mounts; note this runs actually after the render
    useEffect(() => {
        // console.log("the app component mounted");
        //fetch user info from the server

        fetch("/api/user")
            .then((response) => response.json())
            .then((data) => {
                // console.log("data after fetching user data", data);
                //pass the user info to the app
                setFirst(data.first);
                setLast(data.last);
                setAvatarUrl(data.avatarurl);
                setBio(data.bio);
            })
            .catch((err) => {
                //TO DO: handle error here
                console.log(err);
            });
    }, []);

    const toggleUploader = () => {
        //this is changing to the opposite value of uploaderIsVisible
        setUploader(!uploaderIsVisible);
    };

    const saveDraftBioToApp = (draftBio) => {
        setBio(draftBio);
    };

    //change profile pic from child (ProfilePic) to parent (App); pass this entire function as a prop (named changePic)
    const changeProfilePic = (newUrl) => {
        setAvatarUrl(newUrl);
        setUploader(!uploaderIsVisible);
    };

    const logout = () => {
        fetch("/logout")
            .then((resp) => resp.json())
            .then(() => {
                // console.log("data after logout", data);
                //redirect to login
                location.replace("/login");
                // location.reload("/"); //this did not work
            })
            .catch((err) => {
                console.log(err);
            });
    };

    //FRIENDS AND WANNABES info
    const dispatch = useDispatch();
    //very important to define the following two variables: they allow the DOM to react to changes in Redux data

    //first case of useSelector - if there is friends data, give back the ones with accepted false (wannabes)
    //be careful about not messing up the arrow function below, it needs to return smth
    const wannabes = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => !friend.accepted)
    );
    // console.log("wannabes from the global state", wannabes);
    //second case useSelector - if there is friends data, give back the ones with accepted true (friends)
    const friends = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => friend.accepted)
    );
    // console.log("friends from the global state", friends);

    useEffect(() => {
        //note the argument of useEffect: do this just once on mount, the rest of the state will be handled by Redux!

        //the condition below ensures we don't talk to the database needlessly
        if (friends.length == 0 || wannabes.length == 0) {
            (async () => {
                try {
                    const res = await fetch("/api/friends");
                    const data = await res.json();
                    console.log(
                        "data after fetch friends and wannabes",
                        data.friends
                    );
                    //data is 1. array of objects when there is data; 2. empty array for 0 friends; 3. a message if there was an error

                    //exclude cases when there is no data or when there was an error
                    if (data.length !== 0 || !data.message) {
                        // pass data from server to redux; redux will update our data because we use useSelector;
                        // console.log("sending data to redux");
                        //careful about the type of data being sent - wrapping it in an object or not
                        dispatch(receiveFriendsAndWannabes(data.friends));
                    }
                } catch (err) {
                    //TO DO: handle error here
                    console.log("error in fetch friends", err);
                }
            })();
        }
    }, []);

    //FIX THIS - stopped working after including subcomponents
    //return something while we wait for the fetch above
    // if (friends.length == 0 || wannabes.length == 0) {
    //     return null;
    // }

    return (
        <>
            <BrowserRouter>
                <div className="loggedin-container">
                    <Logo />
                    <div className="navmenu">
                        <NavLink
                            // "exact" ensures only this link is marked as active when its descendant paths are matched
                            exact
                            to="/"
                        >
                            My profile
                        </NavLink>
                        <NavLink exact to="/friends">
                            Friends
                        </NavLink>
                        <NavLink exact to="/chat">
                            Chat
                        </NavLink>
                        <NavLink exact to="/users">
                            Find people
                        </NavLink>
                        <NavLink exact to="/logout" onClick={logout}>
                            Logout
                        </NavLink>
                    </div>
                    {/* passing the user data to ProfilePic */}
                    <ProfilePic
                        first={first}
                        last={last}
                        image={avatarUrl}
                        toggleUploader={toggleUploader}
                    />
                </div>
                <div id="footer">
                    <Footer />
                </div>
                <div className="uploader-container">
                    {uploaderIsVisible && (
                        <Uploader
                            changePic={changeProfilePic}
                            toggleUploader={toggleUploader}
                        />
                    )}
                </div>
                {uploaderIsVisible && <div className="overlay"></div>}
                {/* browser router for profile, FindPeople & OtherProfile, use the Switch to be able to add a catch all */}
                <Switch>
                    <Route exact path="/">
                        {/* setting a separate css class for the profile that will also affect ProfilePic */}
                        {/* <div className="title-container"> */}
                        {/* passing the user data to Profile */}
                        <Profile
                            first={first}
                            last={last}
                            bio={bio}
                            image={avatarUrl}
                            toggleUploader={toggleUploader}
                            saveDraftBioToApp={saveDraftBioToApp}
                        />
                        {/* </div> */}
                    </Route>
                    <Route exact path="/users">
                        <FindPeople />
                    </Route>
                    <Route exact path="/user/:id">
                        {/* don't put anything in the OtherProfile component as a prop, we will do a fetch for this */}
                        <OtherProfile />
                    </Route>
                    <Route exact path="/friends">
                        <FriendsAndWannabes />
                    </Route>
                    <Route exact path="/chat">
                        <Chat />
                    </Route>
                    {/* <Route path="/logout">
                        <Redirect to="/" />
                    </Route> */}
                    <Route path="*">
                        <Redirect to="/" />
                    </Route>
                </Switch>
            </BrowserRouter>
        </>
    );
}

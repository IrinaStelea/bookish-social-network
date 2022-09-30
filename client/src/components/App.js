import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    BrowserRouter,
    Route,
    NavLink,
    Redirect,
    Switch,
} from "react-router-dom";

import Logo from "./Logo.js";
import Footer from "./Footer.js";
import ProfilePic from "./ProfilePic.js";
import Uploader from "./Uploader.js";
import Profile from "./Profile.js";
import FindPeople from "./FindPeople.js";
import OtherProfile from "./OtherUserProfile.js";
import FriendsAndWannabes from "./friends-wannabes/FriendsAndWannabes.js";
import Chat from "./chat/Chat.js";
import Dropdown from "./Dropdown.js";
import DeleteAccount from "./Delete.js";
import NotificationUserOnline from "./Notification.js";
import FriendRequest from "./FriendRequest.js";

import { receiveFriendsAndWannabes } from "../redux/friends/slice.js";
import { userDataReceive } from "../redux/userdata/slice.js";
import { wallPostsReceived } from "../redux/wallposts/slice.ts";

import "../css/MainStylesheet.css";

export default function App() {
    const dispatch = useDispatch();

    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [bio, setBio] = useState("");
    const [uploaderIsVisible, setUploader] = useState(false);
    const [deleteIsVisible, setDelete] = useState(false);

    //get the wannabes and friends
    const wannabes = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => !friend.accepted)
    );
    const friends = useSelector(
        (state) =>
            state.friends && state.friends.filter((friend) => friend.accepted)
    );

    const toggleUploader = () => {
        setUploader(!uploaderIsVisible);
    };

    const toggleDeleteConfirmation = () => {
        setDelete(!deleteIsVisible);
    };

    const saveDraftBioToApp = (draftBio) => {
        setBio(draftBio);
    };

    const changeProfilePic = (newUrl) => {
        setAvatarUrl(newUrl);
        setUploader(!uploaderIsVisible);
    };

    //fetch user info
    useEffect(() => {
        fetch("/api/current-user")
            .then((response) => response.json())
            .then((data) => {
                if (!data.success) {
                    history.push("/");
                } else {
                    setFirst(data.profile.first);
                    setLast(data.profile.last);
                    setAvatarUrl(data.profile.avatarurl);
                    setBio(data.profile.bio);
                    dispatch(userDataReceive(data.profile));
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    //fetch user friends and wannabes
    useEffect(() => {
        //the condition below ensures we don't talk to the database needlessly
        if (friends.length == 0 || wannabes.length == 0) {
            (async () => {
                try {
                    const res = await fetch("/api/friends");
                    const data = await res.json();
                    //exclude cases where there's no data or when there was an error
                    if (data.length !== 0 || !data.message) {
                        dispatch(receiveFriendsAndWannabes(data.friends));
                    }
                } catch (err) {
                    console.log("error in fetch friends", err);
                }
            })();
        }
    }, []);

    //fetch user wall posts
    useEffect(() => {
        fetch("/api/wallposts")
            .then((response) => response.json())
            .then((data) => {
                console.log("data from fetch wallposts in App", data);
                if (data.wallPosts.length && !data.message) {
                    dispatch(wallPostsReceived(data.wallPosts));
                }
            })
            .catch((err) => {
                console.log("error from fetch wallposts", err);
            });
    }, []);

    return (
        <>
            <BrowserRouter>
                <div className="loggedin-container">
                    <Logo />
                    <div className="navmenu">
                        <NavLink exact to="/">
                            My profile
                        </NavLink>
                        <NavLink exact to="/friends">
                            Friends
                        </NavLink>
                        <NavLink exact to="/chat">
                            Chat{}
                        </NavLink>
                        <NavLink exact to="/users">
                            Find people
                        </NavLink>
                    </div>
                    <div className="profile-info">
                        <FriendRequest />
                        <ProfilePic
                            first={first}
                            last={last}
                            image={avatarUrl}
                            toggleUploader={toggleUploader}
                        />
                        <Dropdown
                            toggleUploader={toggleUploader}
                            toggleDelete={toggleDeleteConfirmation}
                            first={first}
                        />
                    </div>
                </div>
                <NotificationUserOnline />
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
                    {deleteIsVisible && (
                        <DeleteAccount
                            toggleDelete={toggleDeleteConfirmation}
                        />
                    )}
                </div>
                {(uploaderIsVisible || deleteIsVisible) && (
                    <div className="overlay"></div>
                )}
                <Switch>
                    <Route exact path="/">
                        <Profile
                            first={first}
                            last={last}
                            bio={bio}
                            image={avatarUrl}
                            toggleUploader={toggleUploader}
                            saveDraftBioToApp={saveDraftBioToApp}
                        />
                    </Route>
                    <Route exact path="/users">
                        <FindPeople />
                    </Route>
                    <Route path="/user/:id">
                        <OtherProfile />
                    </Route>
                    <Route exact path="/friends">
                        <FriendsAndWannabes />
                    </Route>
                    <Route exact path="/chat">
                        <Chat />
                    </Route>
                    <Route path="*">
                        <Redirect to="/" />
                    </Route>
                </Switch>
            </BrowserRouter>
        </>
    );
}

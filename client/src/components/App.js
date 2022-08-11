// this component holds all the log in info

import { Component } from "react";
import Logo from "./Logo.js";
import ProfilePic from "./ProfilePic.js";
import Uploader from "./Uploader.js";
import "./Registration.css";
import Profile from "./Profile.js";
import FindPeople from "./FindPeople.js";
import OtherProfile from "./OtherProfile.js";

import { BrowserRouter, Route, Redirect } from "react-router-dom";

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //user information
            first: "",
            last: "",
            avatarUrl: "",
            bio: "",
            //variable to track if the uploader is open or not
            uploaderIsVisible: false,
        };
        this.changeProfilePic = this.changeProfilePic.bind(this);
        this.toggleUploader = this.toggleUploader.bind(this);
        this.saveDraftBioToApp = this.saveDraftBioToApp.bind(this);
    }

    //to fetch server info once the component mounts; this runs actually after the render
    componentDidMount() {
        // console.log("the app component mounted");
        //fetch user info from the server

        fetch("/api/user")
            .then((response) => response.json())
            .then((data) => {
                // console.log("data after fetching user data", data);
                //pass the user info to the app
                this.setState({
                    first: data.first,
                    last: data.last,
                    avatarUrl: data.avatarurl,
                    bio: data.bio,
                });
            })
            .catch((err) => {
                //TO DO: handle error here
                console.log(err);
            });
    }

    toggleUploader() {
        //this is changing to the opposite value of uploaderIsVisible
        this.setState({ uploaderIsVisible: !this.state.uploaderIsVisible });
    }

    saveDraftBioToApp(draftBio) {
        this.setState({ bio: draftBio });
    }

    //change profile pic from child (ProfilePic) to parent (App); pass this entire function as a prop (named changePic)
    changeProfilePic(newUrl) {
        this.setState({
            avatarUrl: newUrl,
            uploaderIsVisible: !this.state.uploaderIsVisible,
        });
    }

    render() {
        return (
            <>
                <div className="loggedin-container">
                    <Logo />

                    {/* passing the user data to ProfilePic */}
                    <ProfilePic
                        first={this.state.first}
                        last={this.state.last}
                        image={this.state.avatarUrl}
                        toggleUploader={this.toggleUploader}
                    />
                </div>
                <div className="uploader-container">
                    {this.state.uploaderIsVisible && (
                        <Uploader
                            changePic={this.changeProfilePic}
                            toggleUploader={this.toggleUploader}
                        />
                    )}
                </div>
                {this.state.uploaderIsVisible && (
                    <div className="overlay"></div>
                )}
                {/* browser router for profile, FindPeople & OtherProfile */}
                <BrowserRouter>
                    <Route exact path="/">
                        {/* setting a separate css class for the profile that will also affect ProfilePic */}
                        <div className="profile-container">
                            {/* passing the user data to Profile */}
                            <Profile
                                first={this.state.first}
                                last={this.state.last}
                                bio={this.state.bio}
                                image={this.state.avatarUrl}
                                toggleUploader={this.toggleUploader}
                                saveDraftBioToApp={this.saveDraftBioToApp}
                            />
                        </div>
                    </Route>
                    <Route path="/users">
                        <FindPeople />
                    </Route>
                    <Route path="/user/:id">
                        {/* don't put anything in the OtherProfile component as a prop, we will do a fetch for this */}
                        <OtherProfile />
                    </Route>
                    {/* <Route path="*">
                        <Redirect to="/" />
                    </Route> */}
                    {/* <Route path="*" render={() => <Redirect to="/" />} /> */}
                </BrowserRouter>
            </>
        );
    }
}
import "./Registration.css";
import ProfilePic from "./ProfilePic";
import BioEditor from "./BioEditor";

export default function Profile({
    toggleUploader,
    saveDraftBioToApp,
    bio,
    first,
    last,
    image,
}) {
    return (
        <>
            {/* <h3>Profile</h3> */}
            <div className="profile-container">
                <ProfilePic image={image} toggleUploader={toggleUploader} />
                {/* passing user data to BioEditor */}
                <BioEditor
                    saveDraftBioToApp={saveDraftBioToApp}
                    bio={bio}
                    first={first}
                    last={last}
                />
            </div>
        </>
    );
}

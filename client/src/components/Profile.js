import ProfilePic from "./ProfilePic";
import BioEditor from "./BioEditor";
import "../css/MainStylesheet.css";

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
            <div className="profile-container">
                <ProfilePic image={image} toggleUploader={toggleUploader} />
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

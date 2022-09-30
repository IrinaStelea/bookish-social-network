import { useSelector } from "react-redux";
import ProfilePic from "./ProfilePic";
import BioEditor from "./BioEditor";
import Wall from "./wall/Wall";
import "../css/MainStylesheet.css";

export default function Profile({
    toggleUploader,
    saveDraftBioToApp,
    bio,
    first,
    last,
    image,
}) {
    const wallPosts = useSelector((state) => state.wallPosts);
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
            <section className="wall">
                <h3>My wall</h3>
                <Wall wallPosts={wallPosts} />
            </section>
        </>
    );
}

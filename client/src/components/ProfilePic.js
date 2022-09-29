import "../css/MainStylesheet.css";

export default function ProfilePic({ first, last, image, toggleUploader }) {
    image = image || "../../no_avatar.png";
    first = first || "default";
    last = last || "avatar";

    return (
        <>
            <img
                onClick={toggleUploader}
                src={image}
                id="avatar"
                alt={first + " " + last}
            />
        </>
    );
}

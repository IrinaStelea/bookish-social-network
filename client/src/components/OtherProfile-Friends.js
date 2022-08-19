import FriendButton from "./FriendButton";

export default function OtherFriends({ first, otherFriends }) {
    return (
        <>
            {(otherFriends.length !== 0 && (
                <div className="friends-container">
                    {otherFriends.map((friend) => {
                        return (
                            <div className="friends-cell" key={friend.id}>
                                <a href={"/user/" + friend.id}>
                                    <img
                                        src={
                                            friend.avatarurl ||
                                            "../../no_avatar.png"
                                        }
                                        alt={friend.first + " " + friend.last}
                                    />
                                </a>
                                <div className="friends-name-button">
                                    <a href={"/user/" + friend.id}>
                                        {friend.first} {friend.last}
                                    </a>
                                    {/* pass down userid for the button in the other friends list to work */}
                                    <FriendButton userid={friend.id} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )) || <p>{first} has no friends.</p>}
        </>
    );
}

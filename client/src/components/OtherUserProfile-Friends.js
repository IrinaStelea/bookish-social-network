import FriendButton from "./FriendButton";

export default function OtherUserFriends({ first, otherUserFriends }) {
    return (
        <>
            {(otherUserFriends.length !== 0 && (
                <div className="friends-container">
                    {otherUserFriends.map((friend) => {
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

export default function Friends({ friends, handleUnfriend }) {
    return (
        <div className="friends-container">
            {friends.map((friend) => {
                return (
                    <div className="friends-cell" key={friend.id}>
                        <a href={"/user/" + friend.id}>
                            <img
                                src={friend.avatarurl || "../../no_avatar.png"}
                                alt={friend.first + " " + friend.last}
                            />
                        </a>
                        <div className="friends-name-button">
                            <a href={"/user/" + friend.id}>
                                {friend.first} {friend.last}
                            </a>
                            <button
                                className="deny-friend-button"
                                onClick={() => handleUnfriend(friend.id)}
                            >
                                Unfriend
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

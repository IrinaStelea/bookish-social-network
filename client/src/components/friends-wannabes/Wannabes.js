export default function Wannabes({ wannabes, handleAccept, handleUnfriend }) {
    return (
        <div className="friends-container">
            {wannabes.map((wannabe) => {
                return (
                    <div className="friends-cell" key={wannabe.id}>
                        <a href={"/user/" + wannabe.id}>
                            <img
                                src={wannabe.avatarurl || "../../no_avatar.png"}
                                alt={wannabe.first + " " + wannabe.last}
                            />
                        </a>
                        <div className="friends-name-button">
                            <a href={"/user/" + wannabe.id}>
                                {wannabe.first} {wannabe.last}
                            </a>
                            <button
                                className="friend-button"
                                onClick={() => handleAccept(wannabe.id)}
                            >
                                Add as friend
                            </button>
                            <button
                                className="deny-friend-button"
                                onClick={() => handleUnfriend(wannabe.id)}
                            >
                                Do not add
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

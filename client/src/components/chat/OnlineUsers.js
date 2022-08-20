const OnlineUsers = ({ users }) => {
    return (
        <div id="online-users-panel">
            <h5>Currently online</h5>
            <div className="online-users">
                {users.map((user) => {
                    return (
                        <div className="online-user-row" key={user.id}>
                            <a href={"/user/" + user.id}>
                                <img
                                    id="online-user-avatar"
                                    src={
                                        user.avatarurl || "../../no_avatar.png"
                                    }
                                    alt={user.first + " " + user.last}
                                />
                            </a>
                            <a href={"/user/" + user.id}>{user.first}</a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OnlineUsers;

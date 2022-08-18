export default function OtherFriends({ first, otherFriends }) {
    // const dispatch = useDispatch();

    // const otherFriends = useSelector((state) => state.otherFriends);
    // console.log("other friends from the global state", otherFriends);

    // useEffect(() => {
    //     if (otherFriends.length == 0) {
    //         (async () => {
    //             try {
    //                 console.log("the id in other profile is", id);
    //                 const res = await fetch(`/api/otherfriends/${id}`);
    //                 const data = await res.json();
    //                 console.log("data after fetch other friends", data.friends);

    //                 //exclude cases when there is no data or when there was an error
    //                 if (data.length !== 0 || !data.message) {
    //                     // pass data from server to redux; redux will update our data because we use useSelector;
    //                     // console.log("sending data to redux");
    //                     //careful about the type of data being sent - wrapping it in an object or not
    //                     dispatch(receiveOtherFriends(data.friends));
    //                 }
    //             } catch (err) {
    //                 //TO DO: handle error here
    //                 console.log("error in fetch other friends", err);
    //             }
    //         })();
    //     }
    // }, []);

    //FIX THIS
    // if (otherFriends.length == 0) {
    //     return null;
    // }

    // console.log("other friends length", otherFriends.length);

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
                                </div>
                            </div>
                        );
                    })}
                </div>
            )) || <p>{first} has no friends.</p>}
        </>
    );
}

//this is the first component in SN that uses hooks
import { useState, useEffect } from "react";

export default function FindPeople() {
    // define the properties
    const [value, setValue] = useState("");
    const [users, setUsers] = useState([]);

    // useEffect for fetch when components mounts
    useEffect(() => {
        let abort; //starting as undefined = falsey
        console.log("useEffect on mount is running");
        (async () => {
            const data = await fetch(`/api/findusers/${value}.json`).then(
                (response) => response.json()
            );
            //only update user data if abort is falsey
            if (!abort) {
                setUsers(!value ? data.slice(0, 3) : data);
            }
        })();
        //cleanup function - React will call it before every re-render of the component (and for the unmount)
        return () => {
            abort = true;
        };

        // useEffect for fetch when components mounts
        // useEffect(() => {
        //     console.log("useEffect on mount is running");
        //     console.log("fetch query", `/findusers/${first}`);
        //     fetch(`/findusers/${first}.json`)
        //         .then((resp) => resp.json())
        //         .then((data) => {
        //             console.log("data after fetch users.json: ", data);
        //             //pass the most recent users to state, deciding how much of it to show
        //             if (!first) {
        //                 setUsers(data.slice(0, 3));
        //             } else {
        //                 setUsers(data);
        //             }
        //         })
        //         .catch((err) => {
        //             //TO DO: handle error here
        //             console.log("error in fetch request", err);
        //         });

        //note second arg below: this means useEffect will run when the component mounts and each time first changes
    }, [value]);

    return (
        <div className="people">
            {/* conditional rendering of elements on this page based on whether there is a search query */}
            <h3>Find people</h3>
            {!value && <p>Check out who just joined:</p>}
            {!value &&
                users.map((item) => (
                    // note use of key to so that each element is considered unique by React
                    <div key={item.id} className="people-container">
                        <a href={"/user/" + item.id}>
                            <img
                                src={item.avatarurl || "../../no_avatar.png"}
                                alt={item.first + " " + item.last}
                            />
                        </a>

                        <a href={"/user/" + item.id}>
                            {item.first} {item.last}
                        </a>
                    </div>
                ))}
            {!value && (
                <>
                    <hr />
                    <p>Looking for someone in particular?</p>
                </>
            )}
            <input
                placeholder="Enter name"
                onChange={(e) => setValue(e.target.value)}
                defaultValue={value}
            />
            {value &&
                users.map((item) => (
                    // note use of key to so that each element is considered unique by React
                    <div key={item.id} className="people-container">
                        <a href={"/user/" + item.id}>
                            <img
                                src={item.avatarurl || "../../no_avatar.png"}
                                alt={item.first + " " + item.last}
                            />
                        </a>

                        <a href={"/user/" + item.id}>
                            {item.first} {item.last}
                        </a>
                    </div>
                ))}
        </div>
    );
}

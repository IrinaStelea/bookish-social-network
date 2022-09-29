import { useState, useEffect } from "react";

export default function FindPeople() {
    const [value, setValue] = useState("");
    const [users, setUsers] = useState([]);

    useEffect(() => {
        let abort; //starting as undefined = falsey
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
    }, [value]);

    return (
        <div className="people">
            {/* conditional rendering of elements on this page based on whether a search query exists*/}
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

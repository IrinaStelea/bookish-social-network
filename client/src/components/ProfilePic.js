// this will display the info we get from app, can be a function component; we need to pass props to it

import "./Registration.css";

export default function ProfilePic({ first, last, image, toggleUploader }) {
    //render a default image if there is no image
    image = image || "../../no_avatar.png";
    first = first || "default";
    last = last || "avatar";

    return (
        <>
            {/* <button onClick={togglePopup}>Open popup</button> */}
            <img
                onClick={toggleUploader}
                src={image}
                id="avatar"
                alt={first + " " + last}
            />
        </>
    );
}

//we get the props argument from what is passed to ProfilePic in app.js; it is an object with the properties firstName and changeName (which is a function), both are defined in app.js; props is destructured in the function below
// export default function ProfilePic({ firstName, changeName }) {
//     // console.log("props in profile pic", firstName, changeName); //props
//     return (
//         <>
//             {/* <div>My name is {firstName}</div> */}
//             {/* note the arrow function syntax for calling the function */}
//             {/* <button onClick={() => changeName("Jan")}>Change name</button> */}
//             <button>Open popup</button>
//         </>
//     );
// }

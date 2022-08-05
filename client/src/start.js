import ReactDOM from "react-dom";
import Welcome from "./components/Welcome.js";
import Logo from "./components/Logo.js";

// ReactDOM.render(<Welcome />, document.querySelector("main"));

// function HelloWorld() {
//     return <div>Hello, World!</div>;
// }

// figure out what should be rendered based on whether users are logged in or not (this check happens before React even renders anything)
fetch("/user/id.json")
    .then((response) => response.json())
    .then((data) => {
        if (!data.userId) {
            // this means that the user doens't have a userId and should see Welcome/Registration for now
            console.log("data userId should be undefined", data.userId);
            ReactDOM.render(<Welcome />, document.querySelector("main"));
        } else {
            // this means the user is registered because their browser DID have the right cookie and they should be shown a page with the logo
            ReactDOM.render(<Logo />, document.querySelector("main"));
        }
    });

import ReactDOM from "react-dom";
import Welcome from "./Welcome.js";

ReactDOM.render(<Welcome />, document.querySelector("main"));

// function HelloWorld() {
//     return <div>Hello, World!</div>;
// }

// figure out what should be rendered based on whether users are logged in or not
fetch("/user/id.json")
    .then((response) => response.json())
    .then((data) => {
        if (!data.userId) {
            // this means that the user doens't have a userId and should see Welcome/Registration for now
            ReactDOM.render(<Welcome />, document.querySelector("main"));
        } else {
            // this means the user is registered because their browser DID have the right cookie and they should be shown a page with the logo
            ReactDOM.render(
                <img
                    src="https://cdn.socialchamp.io/wp-content/uploads/2019/01/SC-Blog-Banner_Nov_2018_1078x516_14.png"
                    alt="illustration social network"
                />,
                document.querySelector("main")
            );
        }
    });

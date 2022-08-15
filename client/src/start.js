//this is where we import Redux
//best practice is to put 3rd party imports before my own imports
import { createStore, applyMiddleware } from "redux";
import * as immutableState from "redux-immutable-state-invariant";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./redux/reducer.js";
import ReactDOM from "react-dom";
import Welcome from "./components/Welcome.js";
import App from "./components/App.js";

//set up App to use Redux
import { Provider } from "react-redux";
// ReactDOM.render(<Welcome />, document.querySelector("main"));

const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(immutableState.default()))
);

// figure out what should be rendered based on whether users are logged in or not (this check happens before React even renders anything)
fetch("/user/id.json")
    .then((response) => response.json())
    .then((data) => {
        if (!data.userId) {
            // this means that the user doens't have a userId and should see Welcome/Registration for now
            // console.log("data userId should be undefined", data.userId);
            ReactDOM.render(<Welcome />, document.querySelector("main"));
        } else {
            // this means the user is registered because their browser DID have the right cookie and they should be shown a page with the logo
            //wrap redux around app
            ReactDOM.render(
                <Provider store={store}>
                    <App />
                </Provider>,
                document.querySelector("main")
            );
        }
    });

import ReactDOM from "react-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import * as immutableState from "redux-immutable-state-invariant";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./redux/reducer";
import Welcome from "./components/Welcome.js";
import App from "./components/App.js";
import { init } from "./socket.js";

//use DevTools as middleware
const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk, immutableState.default()))
);

fetch("/user/id.json")
    .then((response) => response.json())
    .then((data) => {
        //check for existence of userid on cookie session
        if (!data.userId) {
            ReactDOM.render(<Welcome />, document.querySelector("main"));
        } else {
            init(store); //provide the store to socket init at the beginning of the App lifecycle
            ReactDOM.render(
                <Provider store={store}>
                    <App />
                </Provider>,
                document.querySelector("main")
            );
        }
    });

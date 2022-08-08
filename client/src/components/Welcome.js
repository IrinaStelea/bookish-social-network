import { Component } from "react";
import Registration from "./Registration.js"; //if you import smth that is exported as default it should not be in curly braces
import ResetPassword from "./ResetPassword";
import Login from "./Login.js";

//setup for React router
import { BrowserRouter, Route } from "react-router-dom";

export default class Welcome extends Component {
    render() {
        //the render function always has to return something
        return (
            <>
                <h1>Welcome to Bookish</h1>
                <BrowserRouter>
                    {/* the / route is too vague and all routes will go to it unless we include the attribute exact */}
                    <Route exact path="/">
                        <Registration />
                    </Route>
                    <Route path="/login">
                        <Login />
                    </Route>
                    <Route
                        path="/reset-password"
                        component={ResetPassword}
                    ></Route>
                </BrowserRouter>
            </>
        );
    }
}

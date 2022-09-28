import { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Registration from "./Registration.js";
import ResetPassword from "./ResetPassword";
import Login from "./Login.js";

export default class Welcome extends Component {
    render() {
        return (
            <>
                <BrowserRouter>
                    <Switch>
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
                        <Route path="*">
                            <Redirect to="/" />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </>
        );
    }
}

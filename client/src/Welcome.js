import { Component } from "react";
import Registration from "./Registration.js"; //if you import smth that is exported as default it should not be in curly braces

export default class Welcome extends Component {
    render() {
        //the render function always has to return something
        return (
            <>
                <h1>Welcome</h1>
                <Registration />
            </>
        );
    }
}

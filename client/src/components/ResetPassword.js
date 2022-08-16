import { Component } from "react";
import { Link } from "react-router-dom";

export default class resetPassword extends Component {
    constructor() {
        super();
        this.state = {
            view: 1,
            email: "",
            code: "",
            password: "",
            errorMessage: "",
            errors: {
                email: false,
                code: false,
                password: false,
            },
        };
        this.currentView = this.currentView.bind(this);
        this.onFormInputChange = this.onFormInputChange.bind(this);
        this.startResetPassword = this.startResetPassword.bind(this);
        this.resetPassword = this.resetPassword.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    onFormInputChange(e) {
        const target = e.currentTarget;
        console.log(`${target.value}`);
        this.setState({
            [target.name]: target.value,
        });
    }

    validateForm() {
        const errors = {};
        let validField = false;
        let errorMessage = ``;

        //password
        if (this.state.password && this.state.password.length < 6) {
            errors.password = true;
            validField = true;
            errorMessage +=
                "Please provide a password that's longer than 6 characters \n";
        }

        this.setState({
            errors: errors,
            errorMessage: errorMessage,
        });
        console.log("errors state in validateForm", this.state.errors);
        return validField;
    }

    //function which sets the view stat
    startResetPassword(e) {
        e.preventDefault();

        const formData = {
            email: this.state.email,
        };

        fetch("/password/reset/start.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("data after reset password stage 1 fetch", data);
                //if something goes wrong, display error message
                if (!data.success && data.message) {
                    if (
                        data.message ==
                        "Please check if you entered your email correctly"
                    ) {
                        this.setState({
                            errors: {
                                email: true,
                            },
                        });
                    }

                    this.setState({
                        errorMessage: data.message,
                    });
                } else {
                    //if all is well change to view 2
                    this.setState({ view: 2, errorMessage: "" });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    resetPassword(e) {
        e.preventDefault();

        if (this.validateForm()) {
            console.log("password field not valied, return");
            console.log("error is", this.state.errors);
            return;
        }

        const formData = {
            email: this.state.email,
            code: this.state.code,
            password: this.state.password,
        };

        console.log("stored email in reset password is", this.state.email);
        fetch("/password/reset/verify.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("data after reset password stage 2 fetch", data);
                //if something goes wrong, display error message
                if (!data.success && data.message) {
                    if (
                        data.message ==
                        "Please check if you entered your code correctly"
                    ) {
                        this.setState({
                            errors: {
                                code: true,
                            },
                        });
                    }

                    this.setState({
                        errorMessage: data.message,
                    });
                } else {
                    //if all is well change to view 3
                    this.setState({ view: 3 });
                    //redirect to login - note it is important to use this.props because we are inside a componeent
                    setTimeout(() => {
                        this.props.history.push("/login");
                    }, 3000);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    //create a function to decide what view we are on
    currentView() {
        if (this.state.view === 1) {
            return (
                <>
                    <div className="loggedout-container">
                        <img src="../../Logo_Bookish.png" alt="Logo" />
                        <h4>Reset your password</h4>
                        {this.state.errorMessage && (
                            <p className="error">{this.state.errorMessage}</p>
                        )}
                        <p>Enter the email with which you registered:</p>
                        <form
                            id="send-code"
                            onSubmit={this.startResetPassword}
                            method="post"
                            action="/password/reset/start"
                        >
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={this.state.email}
                                onChange={this.onFormInputChange}
                                className={
                                    this.state.errors.email ? "errorfield" : ""
                                }
                            ></input>
                            <input
                                type="submit"
                                id="submit"
                                value="Send code"
                            ></input>
                        </form>
                        <p>
                            Take me back to <Link to="/login">login</Link>
                        </p>
                    </div>
                </>
            );
        } else if (this.state.view === 2) {
            //next view, button submit code
            //form with code and new password
            //another fetch
            return (
                <>
                    <div className="loggedout-container">
                        <img src="../../Logo_Bookish.png" alt="Logo" />
                        <h4>Reset your password</h4>
                        {this.state.errorMessage && (
                            <p className="error">{this.state.errorMessage}</p>
                        )}

                        <form
                            id="reset"
                            onSubmit={this.resetPassword}
                            method="post"
                            action="/password/reset/verify"
                        >
                            <label htmlFor="code">
                                Enter the code you received:
                            </label>
                            <input
                                type="text"
                                name="code"
                                placeholder="Code"
                                value={this.state.code}
                                onChange={this.onFormInputChange}
                                className={
                                    this.state.errors.code ? "errorfield" : ""
                                }
                            ></input>
                            <label htmlFor="password">
                                Enter a new password:
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={this.state.password}
                                onChange={this.onFormInputChange}
                                className={
                                    this.state.errors.password
                                        ? "errorfield"
                                        : ""
                                }
                            ></input>
                            <input
                                type="submit"
                                id="submit"
                                value="Submit"
                            ></input>
                        </form>
                    </div>
                </>
            );
        } else if (this.state.view === 3) {
            return (
                <>
                    <div className="loggedout-container">
                        <img src="../../Logo_Bookish.png" alt="Logo" />
                        <h4>Password update successful!</h4>
                        <p>
                            You are being redirected to the{" "}
                            <Link to="/login">login page</Link>
                        </p>
                    </div>
                </>
            );
        }
    }

    render() {
        return (
            <>
                {/* <Logo /> */}
                {/* note syntax for calling the function */}
                {this.currentView()}
            </>
        );
    }
}

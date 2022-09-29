import { Component } from "react";
import { Link } from "react-router-dom";
import "../css/MainStylesheet.css";

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            errorMessage: "",
            errors: {
                email: false,
                password: false,
            },
        };
        this.onFormInputChange = this.onFormInputChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    onFormInputChange(e) {
        const target = e.currentTarget;
        this.setState({
            [target.name]: target.value,
        });
    }

    validateForm() {
        const errors = {};
        let validField = false;
        let errorMessage = ``;
        const fields = ["email", "password"];

        for (let field of fields) {
            if (!this.state[field]) {
                errors[field] = true;
                errorMessage = "Please fill out all fields \n";
                validField = true;
            }
        }

        this.setState({
            errors: errors,
            errorMessage: errorMessage,
        });
        return validField;
    }

    onFormSubmit(e) {
        e.preventDefault();

        if (this.validateForm()) {
            return;
        }

        const formData = {
            email: this.state.email,
            password: this.state.password,
        };

        fetch("/login.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                //if something goes wrong, display error message
                if (!data.success && data.message) {
                    this.setState({
                        errorMessage: data.message,
                    });
                } else {
                    //if all is well redirect to "/""
                    location.href = "/";
                }
            })
            .catch((err) => {
                console.log("error in fetch login", err);
            });
    }

    render() {
        return (
            <>
                <h1>Welcome to Bookish</h1>
                <div className="loggedout-container">
                    <img src="../../Logo_Bookish.png" alt="Logo" />
                    {this.state.errorMessage && (
                        <p className="error">{this.state.errorMessage}</p>
                    )}
                    <h4>Login to discuss your favorite books:</h4>
                    <form
                        id="login"
                        onSubmit={this.onFormSubmit}
                        method="post"
                        action="/login"
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
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={this.state.password}
                            onChange={this.onFormInputChange}
                            className={
                                this.state.errors.password ? "errorfield" : ""
                            }
                        ></input>
                        <input type="submit" id="submit" value="Login"></input>
                    </form>
                    <p>
                        Forgot your password?{" "}
                        <Link to="/reset-password">Reset password</Link>
                    </p>
                    <p>
                        No login yet? <Link to="/">Register</Link>
                    </p>
                </div>
            </>
        );
    }
}

export default Login;

import { Component } from "react";
import { Link } from "react-router-dom";
import "../css/MainStylesheet.css";

class Registration extends Component {
    constructor() {
        super();
        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            errorMessage: "",
            errors: {
                firstName: false,
                lastName: false,
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
        const fields = ["firstName", "lastName", "email", "password"];

        for (let field of fields) {
            if (!this.state[field]) {
                errors[field] = true;
                errorMessage = "Please fill out all fields \n";
                validField = true;
            }
        }

        //email validation
        if (this.state.email) {
            let lastAtPos = this.state.email.lastIndexOf("@");
            let lastDotPos = this.state.email.lastIndexOf(".");

            if (
                !(
                    lastAtPos < lastDotPos &&
                    lastAtPos > 0 &&
                    this.state.email.indexOf("@@") == -1 &&
                    lastDotPos > 2 &&
                    this.state.email.length - lastDotPos > 2
                )
            ) {
                errors.email = true;
                validField = true;
                errorMessage += "Please provide a valid email \n";
            }
        }

        //password validation
        if (this.state.password && this.state.password.length < 6) {
            errors.password = true;
            validField = true;
            errorMessage +=
                "Please provide a password that's longer than 6 characters \n";
        }

        //important to set state only at the end otherwise async behaviour of setState might not lead to realtime updates
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
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            email: this.state.email,
            password: this.state.password,
        };

        fetch("/register.json", {
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
                    //if all is well reload the page
                    location.reload();
                }
            })
            .catch((err) => {
                console.log(err);
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
                    <h4>Register to discuss your favorite books:</h4>
                    <div className="form-container">
                        <form
                            id="registration"
                            onSubmit={this.onFormSubmit}
                            method="post"
                            action="/register"
                        >
                            <label htmlFor="firstName">First name</label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First name"
                                value={this.state.firstName}
                                onChange={this.onFormInputChange}
                                className={
                                    this.state.errors.firstName
                                        ? "errorfield"
                                        : ""
                                }
                            ></input>
                            <label htmlFor="lastName">Last name</label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last name"
                                value={this.state.lastName}
                                onChange={this.onFormInputChange}
                                className={
                                    this.state.errors.lastName
                                        ? "errorfield"
                                        : ""
                                }
                            ></input>
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
                                placeholder="Min 6 characters"
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
                                value="Register"
                            ></input>
                        </form>
                    </div>
                    <p>
                        Already a member? <Link to="/login">Log in</Link>
                    </p>
                </div>
            </>
        );
    }
}

export default Registration;

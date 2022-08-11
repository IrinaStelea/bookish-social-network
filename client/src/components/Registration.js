import { Component } from "react";
import { Link } from "react-router-dom";
import "./Registration.css";
// import useStatefulFields from "../hooks/useStatefulFields";

class Registration extends Component {
    constructor() {
        super();
        this.state = {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            // isUserLoggedIn: false, //convention is that variables with boolean values are prefixed with "is"
            errorMessage: "",
            errors: {
                firstName: false,
                lastName: false,
                email: false,
                password: false,
            },
        };
        //very important to bind these two functions here
        this.onFormInputChange = this.onFormInputChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    componentDidMount() {
        console.log("the registration component mounted");
    }

    componentWillUnmount() {
        //here you can clear up resources that might be needed
    }

    //whenever there is a change in one of the input fields, set the state immediately to update it
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
        const fields = ["firstName", "lastName", "email", "password"];

        for (let field of fields) {
            if (!this.state[field]) {
                errors[field] = true;
                errorMessage = "Please fill out all fields \n";
                console.log("this field is not filled", field);
                validField = true;
            }
        }

        //email
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

        //password
        if (this.state.password && this.state.password.length < 6) {
            errors.password = true;
            validField = true;
            errorMessage +=
                "Please provide a password that's longer than 6 characters \n";
        }

        //consider using error = error first OR error last OR error email OR error password to set the whole thing in one step

        //important to set state only at the end otherwise async behaviour of setState might not lead to realtime updates
        this.setState({
            errors: errors,
            errorMessage: errorMessage,
        });
        console.log("errors state in validateForm", this.state.errors);
        return validField;
    }

    onFormSubmit(e) {
        //prevent form from submitting (default behaviour of forms)
        e.preventDefault();

        if (this.validateForm()) {
            console.log("not all fields are valid, return");
            console.log("error state in onFormSubmit", this.state.errors);
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
                console.log("data after register fetch", data);
                //if something goes wrong, stay on page and display error message
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
    // logInUser() {
    //     this.setState({
    //         isUserLoggedIn: true,
    //     });
    // }

    render() {
        return (
            <>
                {/* condition to check if the user is logged in */}
                {/* {!this.state.isUserLoggedIn && ( */}
                {/* //the second set of brackets to create another parent element
                    <> */}

                <div className="container">
                    <img src="../../Logo_Bookish.png" alt="Logo" />
                    {this.state.errorMessage && (
                        <p className="error">{this.state.errorMessage}</p>
                    )}
                    <h3>Register to discuss your favorite books:</h3>
                    <div className="form-container">
                        <form
                            id="registration"
                            onSubmit={this.onFormSubmit}
                            method="post"
                            action="/register"
                        >
                            <label htmlFor="firstName">First Name</label>
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
                            <label htmlFor="lastName">Last Name</label>
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
                    {/* <button onClick={() => this.logInUser()}>Log in</button> */}
                </div>
                {/* </> */}
                {/* )} */}
                {/* {this.state.isUserLoggedIn && <h1>User is logged in!</h1>} */}
            </>
        );
    }
}

export default Registration;

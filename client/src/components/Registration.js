import { Component } from "react";
import { Link } from "react-router-dom";
import "./Registration.css";

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
            // errors: {
            //     firstName: false,
            //     lastName: false,
            //     email: false,
            //     password: false,
            // },
        };
        //very important to bind these two functions here
        this.onFormInputChange = this.onFormInputChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
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

    onFormSubmit(e) {
        e.preventDefault();
        // if(this.validateFields()){
        //     return;
        // }

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

    // validateFields() {
    //     const errors = {};
    //     let valid = true;
    //     const fields = ["firstName", "lastName", "email", "password"];
    // }

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
                <h3>Welcome</h3>
                <div className="container">
                    <img
                        src="https://cdn.socialchamp.io/wp-content/uploads/2019/01/SC-Blog-Banner_Nov_2018_1078x516_14.png"
                        alt="social media illustration"
                    />
                    {this.state.errorMessage && (
                        <p className="error">{this.state.errorMessage}</p>
                    )}
                    <p>Please register by filling out the form below:</p>
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
                            // className={this.state.errors.firstName ? "error" : ""}
                        ></input>
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last name"
                            value={this.state.lastName}
                            onChange={this.onFormInputChange}
                        ></input>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={this.state.email}
                            onChange={this.onFormInputChange}
                        ></input>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={this.state.password}
                            onChange={this.onFormInputChange}
                        ></input>
                        <input
                            type="submit"
                            id="submit"
                            value="Register"
                        ></input>
                    </form>
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

import { Component } from "react";
import { Link } from "react-router-dom";
import "./Registration.css";

class Login extends Component {
    constructor() {
        super();
        this.state = {
            email: "",
            password: "",
            errorMessage: "",
            // errors: {
            //     email: false,
            //     password: false,
            // },
        };
        //very important to bind these two functions here
        this.onFormInputChange = this.onFormInputChange.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    componentDidMount() {
        console.log("the login component mounted");
    }

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
                console.log("data after login fetch", data);
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
                console.log(err);
            });
    }

    // validateFields() {
    //     const errors = {};
    //     let valid = true;
    //     const fields = ["firstName", "lastName", "email", "password"];
    // }

    render() {
        return (
            <>
                <div className="container">
                    <img src="../../Logo_Bookish.png" alt="Logo" />
                    {this.state.errorMessage && (
                        <p className="error">{this.state.errorMessage}</p>
                    )}
                    <h3>Login to discuss your favorite books:</h3>
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
                            // className={this.state.errors.firstName ? "error" : ""}
                        ></input>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={this.state.password}
                            onChange={this.onFormInputChange}
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

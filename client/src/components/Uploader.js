//component for uploading a new image
import { Component } from "react";

export default class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: {},
            errorMessage: "",
        };
        this.onImageSubmit = this.onImageSubmit.bind(this);
        this.handleImageInput = this.handleImageInput.bind(this);
    }

    handleImageInput(e) {
        const file = e.target.files[0];
        // console.log("e target name", e.target.name);
        // console.log("the uploaded file is", file);
        this.setState({ [e.target.name]: file });
    }

    onImageSubmit(e) {
        // const file = e.target.files[0];
        // console.log("the uploaded file is", e.target);
        e.preventDefault();
        // console.log("this state file is", this.state.file);

        //TO DO: file input validation

        const formData = new FormData();
        formData.append("file", this.state.file);

        fetch("/upload-image", {
            method: "post",
            body: formData,
        })
            .then((result) => result.json())
            .then((data) => {
                console.log("response from upload image fetch", data); //this is the res.json we define in the post /upload route
                if (!data.success && data.message) {
                    this.setState({
                        errorMessage: data.message,
                    });
                } else {
                    //if all is well send avatarurl to parent
                    // location.href = "/";
                    this.props.changePic(data.avatar);
                    // this.setState({
                    //     errorMessage: "Image upload successful",
                    // });
                }
            });
    }

    render() {
        return (
            <div id="uploader">
                <h4 id="close" onClick={this.props.toggleUploader}>
                    X
                </h4>
                <h3>Want to change your image?</h3>
                {this.state.errorMessage && (
                    <p className="error">{this.state.errorMessage}</p>
                )}
                <form
                    id="upload-avatar"
                    onSubmit={this.onImageSubmit}
                    method="post"
                    action="/upload-image"
                >
                    <input
                        type="file"
                        accept="image/*"
                        name="file"
                        onChange={this.handleImageInput}
                    />
                    <input type="submit" id="submit" value="Upload"></input>
                </form>
            </div>
        );
    }
}
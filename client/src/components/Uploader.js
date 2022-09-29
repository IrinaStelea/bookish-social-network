import { Component } from "react";

export default class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            errorMessage: "",
        };
        this.onImageSubmit = this.onImageSubmit.bind(this);
        this.handleImageInput = this.handleImageInput.bind(this);
    }

    handleImageInput(e) {
        const file = e.target.files[0];
        this.setState({ [e.target.name]: file });
    }

    onImageSubmit(e) {
        e.preventDefault();
        //file validation client-side
        if (!this.state.file) {
            this.setState({
                errorMessage: "Please upload a valid image file",
            });
            return;
        }

        if (this.state.file.size > 2097152) {
            this.setState({
                errorMessage: "Image must be less than 2MB",
            });
            return;
        }

        let extension = this.state.file.name.substr(
            this.state.file.name.lastIndexOf(".")
        );

        let validExtensions = [".gif", ".jpg", ".jpeg", ".png"];

        if (validExtensions.indexOf(extension.toLowerCase()) === -1) {
            this.setState({
                errorMessage: "Please upload a valid image file",
            });
            return;
        }

        const formData = new FormData();
        formData.append("file", this.state.file);

        fetch("/upload-image", {
            method: "post",
            body: formData,
        })
            .then((result) => result.json())
            .then((data) => {
                if (!data.success && data.message) {
                    this.setState({
                        errorMessage: data.message,
                    });
                } else {
                    //if all is well send avatarurl to parent
                    this.props.changePic(data.avatar);
                }
            });
    }

    render() {
        return (
            <div id="uploader">
                <h4 id="close-uploader" onClick={this.props.toggleUploader}>
                    X
                </h4>
                <h3>Change your profile picture</h3>
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

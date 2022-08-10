import { Component } from "react";

export default class BioEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            draftBio: "",
            isEditorVisible: false,
            errorMessage: "",
            button: "Cancel",
        };
        this.showEditor = this.showEditor.bind(this);
        this.onFormInputChange = this.onFormInputChange.bind(this);
        this.editBio = this.editBio.bind(this);
    }

    // bio above comes from app -> when the component mounts it checks whetehr there is a bio -> this is going to make the component change accordingly

    showEditor() {
        this.setState({
            isEditorVisible: !this.state.isEditorVisible,
            //note the line below telling it explicitly to get the draftBio from the bio passed down as props; putting this directly in state would not work
            draftBio: this.props.bio,
        });
    }

    onFormInputChange(e) {
        const target = e.currentTarget;
        console.log(`${target.value}`);
        this.setState({
            [target.name]: target.value,
            button: "Save",
        });
    }

    editBio(e) {
        // e.preventDefault();

        fetch("/edit-bio", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ bio: this.state.draftBio }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("data after edit bio", data);
                //if something goes wrong, display error message
                if (!data.success && data.message) {
                    this.setState({
                        errorMessage: data.message,
                    });
                } else {
                    //if all is well call saveDraftBiotoApp to send new bio to app
                    this.props.saveDraftBioToApp(data.bio);
                    //calling show editor to toggle the editor and updating the button state
                    this.showEditor();
                    this.setState({
                        button: "Cancel",
                    });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    render() {
        return (
            <div className="editor-container">
                <h4>
                    {this.props.first} {this.props.last}
                </h4>
                {this.state.errorMessage && (
                    <p className="error">{this.state.errorMessage}</p>
                )}
                {this.state.isEditorVisible ? (
                    <>
                        {/* if the editor is visible show textarea with save button */}
                        <textarea
                            name="draftBio"
                            id="textarea"
                            cols="30"
                            rows="10"
                            value={this.state.draftBio}
                            onChange={(event) => this.onFormInputChange(event)}
                        ></textarea>{" "}
                        <button type="submit" onClick={this.editBio}>
                            {this.state.button}
                        </button>
                    </>
                ) : (
                    <>
                        {/* if the editor is not visible, check whether there is a bio (passed down via props) */}
                        {this.props.bio ? (
                            // if there is a bio, show the edit bio button
                            <>
                                <p id="bio">{this.props.bio}</p>
                                <button onClick={this.showEditor}>
                                    Edit bio
                                </button>
                            </>
                        ) : (
                            // if there is no bio show an add bio button
                            <button onClick={this.showEditor}>Add bio</button>
                        )}
                    </>
                )}
            </div>
        );
    }
}

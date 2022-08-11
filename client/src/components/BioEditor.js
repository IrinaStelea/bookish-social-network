import { Component } from "react";

export default class BioEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // bio comes from app -> when the component mounts it checks whetehr there is a bio -> this is going to make the component change accordingly
            draftBio: props.bio,
            isEditorVisible: false,
            errorMessage: "",
            editing: false,
        };
        this.showEditor = this.showEditor.bind(this);
        this.onFormInputChange = this.onFormInputChange.bind(this);
        this.editBio = this.editBio.bind(this);
    }

    showEditor() {
        this.setState({
            isEditorVisible: !this.state.isEditorVisible,
            editing: false,
        });
    }

    onFormInputChange(e) {
        const target = e.currentTarget;
        console.log(`${target.value}`);
        this.setState({
            draftBio: target.value,
            editing: true,
        });
    }

    editBio() {
        //hide editor and return if there haven't been any changes
        if (!this.state.editing) {
            this.showEditor();
            return;
        }

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
                    //calling show editor to toggle the editor and update the editing state
                    this.showEditor();
                    //if all is well call saveDraftBiotoApp to send new bio to app
                    this.props.saveDraftBioToApp(data.bio);
                    // this.setState({
                    //     button: "Cancel",
                    // });
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
                            defaultValue={this.props.bio}
                            onChange={(event) => this.onFormInputChange(event)}
                        ></textarea>{" "}
                        {this.state.editing && (
                            <button
                                id="save"
                                type="submit"
                                onClick={this.editBio}
                            >
                                Save
                            </button>
                        )}
                        {!this.state.editing && (
                            <button id="cancel" onClick={this.showEditor}>
                                Cancel
                            </button>
                        )}
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
                            <button id="add" onClick={this.showEditor}>
                                Add bio
                            </button>
                        )}
                    </>
                )}
            </div>
        );
    }
}

import { Component } from "react";

export default class BioEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
                //if something goes wrong, display error message
                if (!data.success && data.message) {
                    this.setState({
                        errorMessage: data.message,
                    });
                } else {
                    //if all well toggle the editor and update the draft bio in the state
                    this.showEditor();
                    this.props.saveDraftBioToApp(data.bio);
                }
            })
            .catch((err) => {
                console.log("error in fetch edit-bio", err);
            });
    }

    //conditional rendering of edit-bio buttons
    render() {
        return (
            <div className="name-bio-container">
                <h3>
                    {this.props.first} {this.props.last}
                </h3>
                {this.state.errorMessage && (
                    <p className="error">{this.state.errorMessage}</p>
                )}
                {this.state.isEditorVisible ? (
                    <>
                        {/* if the editor is visible show textarea with save button */}
                        <textarea
                            name="draftBio"
                            id="textarea"
                            cols="40"
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
                            <button
                                id="cancel-button"
                                onClick={this.showEditor}
                            >
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
                            // if there is no bio, show an add bio button
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

export default function DeleteAccount({ toggleDelete }) {
    const deleteAccount = () => {
        fetch("/api/delete-account", {
            method: "POST",
        })
            .then(() => {
                location.replace("/");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div id="uploader">
            <h4 id="close-uploader" onClick={toggleDelete}>
                X
            </h4>
            <h3>Are you sure?</h3>
            <p>
                This will delete all your user information, friendships status
                and chat messages.
            </p>
            <input
                type="submit"
                id="submit"
                value="Yes, delete"
                onClick={deleteAccount}
            ></input>
        </div>
    );
}

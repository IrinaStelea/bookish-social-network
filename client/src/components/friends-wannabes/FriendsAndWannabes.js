import Friends from "./Friends.js";
import Wannabes from "./Wannabes.js";

export default function FriendsAndWannabes() {
    return (
        <>
            <section className="friends">
                <h3>Friend requests:</h3>
                <Wannabes />

                <hr></hr>
                <h3>Friends:</h3>
                <Friends />
            </section>
        </>
    );
}

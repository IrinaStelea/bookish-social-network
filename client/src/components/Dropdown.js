import "./Registration.css";

export default function Dropdown({ first, toggleUploader }) {
    return (
        <div className="dropdown-arrow">
            <h4>{first} ⌄</h4>
            <ul className="dropdown">
                <li>
                    <a onClick={toggleUploader} href="#">
                        Change profile pic
                    </a>
                </li>
                <li>
                    <a href="/logout">Log out</a>
                </li>

                <li>
                    <hr></hr>
                    <a href="#">Delete account</a>
                </li>
            </ul>
        </div>
    );
}

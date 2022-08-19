import "./Registration.css";

export default function Dropdown({ first, toggleUploader, toggleDelete }) {
    return (
        <div className="dropdown-arrow">
            <h4>{first} ⌄</h4>
            <ul className="dropdown">
                <li onClick={toggleUploader}>Change profile pic</li>
                <li>
                    <a href="/logout">Log out</a>
                </li>
                <hr></hr>
                <li onClick={toggleDelete}>Delete account</li>
            </ul>
        </div>
    );
}

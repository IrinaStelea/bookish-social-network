import "./Registration.css";
// import { useState, useEffect } from "react";

export default function Logout() {
    fetch("/logout")
        .then((response) => response.json())
        .then((data) => {
            console.log("data after logout", data);
            //redirect to login
            location.href("/");
        })
        .catch((err) => {
            console.log(err);
        });

    return <></>;
}

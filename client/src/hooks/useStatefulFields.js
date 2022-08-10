import { useState } from "react";

//export a function that uses hooks inside to have stateful fields everywhere in our application; it's important to follow the convention of naming the custom hook with "use", otherwise React won't know it is a hook
export default function useStatefulFields() {
    const [values, setvalues] = useState({});
    const onChange = (e) => {
        setvalues({
            ...values,
            [e.currentTarget.name]: e.currentTarget.value,
        });
    };
    //return the values and the onChange to be used externally
    return [values, onChange];
}

//in the registration
//import useStatefulFields from "../hooks/useStatefulFields.js"

// export default function Registration() {
// const [values, onFormInputChange] = useStatefulFields(); //here we are renaming the function to onFormInputChange

//remove all value attributes from the form
//update for all inputs onChange={onFormInputChange}
///etc
// }

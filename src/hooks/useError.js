import { useState } from "react";

export default function useError(){

    const [errorText, setErrorText] = useState("");
    const [showError, setShowError] = useState(false);

    return [showError, errorText, setShowError, setErrorText];

}
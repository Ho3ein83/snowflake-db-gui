import { useEffect } from "react";
import useAppContext from "../contexts/AppContext.jsx";

export default function useFonts() {
    const currentLanguage = useAppContext(state => state.currentLanguage);

    useEffect(() => {
        async function loadFont() {
            await import("../assets/fonts/global.css");
        }
        loadFont().then(() => null);
    }, [currentLanguage]);
}

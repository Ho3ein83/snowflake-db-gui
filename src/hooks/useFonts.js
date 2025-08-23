import { useEffect } from "react";
import useAppContext from "../contexts/AppContext.jsx";

export default function useFonts() {
    const currentLanguage = useAppContext(state => state.currentLanguage);

    useEffect(() => {
        async function loadFont() {
            /*switch (currentLanguage) {
                case "fa":
                    await import("../assets/fonts/fa.css");
                    break;
                default:
                    await import("../assets/fonts/en.css");
            }*/
            await import("../assets/fonts/global.css");
        }
        loadFont().then(() => null);
    }, [currentLanguage]);
}

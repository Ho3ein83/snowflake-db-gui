import { useEffect } from "react";
import { LocalDatabase } from "../core/Utils.js";
import { useMediaQuery } from "@mui/material";
import useAppContext from "../contexts/AppContext.jsx";

export default function useThemeMode(){

    const themeMode = useAppContext(state => state.themeMode);
    const setThemeMode = useAppContext(state => state.setThemeMode);

    // Detect theme mode based on user preference
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const actualTheme = themeMode === "system" ? (prefersDarkMode ? "dark" : "light") : themeMode;

    useEffect(() => {
        LocalDatabase.set(LocalDatabase.KEY_THEME_MODE, themeMode);
    }, [themeMode]);

    return [actualTheme, themeMode, setThemeMode];

}
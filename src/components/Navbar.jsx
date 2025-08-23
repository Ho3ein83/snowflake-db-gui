import { Button, IconButton, Stack, useMediaQuery } from "@mui/material";
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext.js";
import useAppContext from "../contexts/AppContext.jsx";
import useTranslate from "../languages/useTranslate.jsx";
import { languages } from "../languages/languages.js";
import useContextMenu from "../hooks/useContextMenu.js";
import ContextMenu from "./ContextMenu.jsx";
import { logDevLow } from "../core/Utils.js";

import { IconMoon, IconSun, IconWorld, IconDots } from "@tabler/icons-react";

import "../assets/css/Navbar.css";
import useThemeMode from "../hooks/useThemeMode.js";

export default function Navbar(){

    logDevLow("[Render] Navbar");

    const [actualTheme, themeMode, setThemeMode] = useThemeMode();

    // Language
    const currentLanguage = useAppContext(state => state.currentLanguage);
    const setCurrentLanguage = useAppContext(state => state.setCurrentLanguage);

    // Sidebar
    const sidebarCollapsed = useAppContext(state => state.sidebarCollapsed);
    const setSidebarCollapsed = useAppContext(state => state.setSidebarCollapsed);

    // Localization
    const { __, ...translator } = useTranslate();

    const [languageAnchor, languageOpener, languageCloser] = useContextMenu();

    return (<>

        <Stack direction="column" justifyContent="center" className="MainNavbar" sx={{ padding: 2 }}>

            <Stack direction="row-reverse" alignItems="center" gap={1}>

                <IconButton onClick={() => setThemeMode(actualTheme === "light" ? "dark" : "light")} size="large">
                    {actualTheme === "dark" ? <IconSun size={22}/> : <IconMoon size={22}/>}
                </IconButton>

                <Button variant="contained"
                        onClick={languageOpener}
                        startIcon={<IconWorld size={20}/>}
                >
                    {__("language")}
                </Button>

                <div style={{ flex: 1 }}></div>

                <IconButton onClick={() => setSidebarCollapsed(!sidebarCollapsed)} size="large">
                    <IconDots size={22}/>
                </IconButton>

            </Stack>

        </Stack>

        <ContextMenu anchor={languageAnchor}
                     onClose={languageCloser}
                     sx={{ marginTop: 1 }}
                     items={Object.keys(languages).filter(lang => lang !== currentLanguage).map(lang => ({
                         label: languages[lang].local_name,
                         callback: () => {
                             languageCloser();
                             setTimeout(() => {
                                 setCurrentLanguage(lang);
                             }, 100);
                         }
                     }))}
        />

    </>);
}
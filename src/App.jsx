// Cache
import createCache from "@emotion/cache";

// Hooks and states
import { lazy, useEffect, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// Plugins
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

// Components
import { Box, Paper, Stack, ThemeProvider, Typography, useTheme } from "@mui/material";

// Utilities
import { getAppSetting, getAppSettingBool, getAppSettingInt, hexToRgb, isRtl, logDev, setCookie } from "./core/Utils.js";

// App contexts
import { CacheProvider } from "@emotion/react";
import { ThemeContext } from "./contexts/ThemeContext.js";
import useAppContext from "./contexts/AppContext.jsx";

// Styles
import "./assets/css/App.css";
import Navbar from "./components/Navbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import useFonts from "./hooks/useFonts.js";
import useThemeMode from "./hooks/useThemeMode.js";
import { HashRouter, Route, Routes } from "react-router-dom";
import LazySuspense from "./components/LazySuspense.jsx";
import { WebSocketProvider } from "./contexts/WebsocketProvider.jsx";
import GlobalSnackbar from "./components/GlobalSnackbar.jsx";
import ComingSoonNote from "./components/notes/ComingSoonNote.jsx";

// Lazy pages
const HomePageLazy = lazy(() => import("./pages/HomePage.jsx"));
const DatabasePageLazy = lazy(() => import("./pages/DatabasePage.jsx"));
const BenchmarkPageLazy = lazy(() => import("./pages/./BenchmarkPage"));

function App() {

    logDev("%c[Render] App", "color:#4f14c6");

    useFonts();

    // Language
    const currentLanguage = useAppContext(state => state.currentLanguage);
    const isLanguageRtl = isRtl(currentLanguage);

    // Theme cache
    const themeCache = createCache({
        key: isLanguageRtl ? "muirtl" : "muiltr",
        stylisPlugins: isLanguageRtl ? [prefixer, rtlPlugin] : [prefixer],
    });

    const [actualTheme, themeMode, setThemeMode] = useThemeMode();

    // Theme object
    const theme = useMemo(() => {
        const fontSuffix = `-${currentLanguage === "fa" ? "fa" : "en"}`;
        return createTheme({
            direction: isLanguageRtl ? "rtl" : "ltr",
            palette: {
                mode: actualTheme,
                primary: {
                    main: actualTheme === "dark" ? "#5e3cb3" : "#4f14e6",
                    contrastText: "#fff"
                },
                info: {
                    main: actualTheme === "dark" ? "#046795" : "#039be5",
                    contrastText: "#fff"
                },
                success: {
                    main: actualTheme === "dark" ? "#0e9f50" : "#3dda84",
                    contrastText: "#fff"
                },
                error: {
                    main: actualTheme === "dark" ? "#d1221e" : "#f55753",
                    contrastText: "#fff"
                },
                warning: {
                    main: actualTheme === "dark" ? "#aa5703" : "#f6a04d",
                    contrastText: "#fff"
                },
                background: {
                    default: actualTheme === "dark" ? "#121b28" : "#f5f7f9",
                    paper: actualTheme === "dark" ? "#1e2734" : "#fff",
                    // paper: actualTheme === "dark" ? "#1e2734" : "#fff",
                },
                text: {
                    primary: actualTheme === "dark" ? "#fff" : "#000",
                    secondary: actualTheme === "dark" ? "#fff" : "#000",
                },
            },
            typography: {
                fontFamily: currentLanguage === "en" ? `kalameh${fontSuffix}, shabnam${fontSuffix}` : `shabnam${fontSuffix}`,
                button: {
                    textTransform: "none"
                },
                h1: {
                    fontSize: "2.4rem",
                    fontFamily: `kalameh${fontSuffix}`
                },
                h2: {
                    fontSize: "2rem"
                },
                h3: {
                    fontSize: "1.5rem"
                },
                h4: {
                    fontSize: "1.2rem"
                },
                h5: {
                    fontSize: "1rem"
                },
                h6: {
                    fontSize: "0.8rem"
                }
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            borderRadius: 8,
                        },
                        sizeSmall: {
                            borderRadius: 12,
                            height: "36px"
                        },
                        sizeMedium: {
                            borderRadius: 12,
                            height: "40px"
                        },
                        sizeLarge: {
                            borderRadius: 12,
                            height: "46px"
                        },
                    },
                    defaultProps: {
                        disableElevation: true
                    }
                },
                MuiCard: {
                    defaultProps: {
                        elevation: 0
                    },
                    styleOverrides: {
                        root: {
                            position: "relative",
                            borderRadius: 16,
                            backgroundColor: "var(--sfd-fg-color)",
                            boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 2px 0px"
                        }
                    }
                },
                MuiTooltip: {
                    styleOverrides: {
                        tooltip: {
                            fontSize: 13,
                            fontFamily: `shabnam${fontSuffix}`,
                            padding: "10px 16px",
                            backgroundColor: "rgba(var(--sfd-text-color-rgb), .6)",
                            color: "var(--sfd-bg-color)",
                            backdropFilter: "blur(3px)"
                        }
                    }
                },
                MuiDialog: {
                    styleOverrides: {
                        paper: {
                            borderRadius: "16px"
                        }
                    }
                },
                MuiDialogTitle: {
                    styleOverrides:{
                        root: {
                            fontSize: 20,
                            fontWeight: "bold",
                            padding: 0
                        }
                    }
                }
            },
            shape: {
                borderRadius: 8,
            },
        });
    }, [actualTheme, isLanguageRtl]);

    // Update page layout
    useEffect(() => {
        document.documentElement.lang = currentLanguage;
        document.documentElement.dir = isLanguageRtl ? "rtl" : "ltr";
        setCookie(`${getAppSetting("prefix", "")}lang`, currentLanguage);
        document.body.classList.remove("rtl", "ltr");
        document.body.classList.add(isLanguageRtl ? "rtl" : "ltr");
    }, [currentLanguage, isLanguageRtl]);

    // Mark theme mode in body for easier styling
    useEffect(() => {
        document.body.classList.remove("light", "dark");
        document.body.classList.add(actualTheme);
    }, [actualTheme]);

    // Use context for theme mode to be able to change it from anywhere
    const contextValue = useMemo(() => ({themeMode, setThemeMode,}), [themeMode]);

    return (
        <CacheProvider value={themeCache}>

            <ThemeProvider theme={theme}>

                <ThemeContext value={contextValue}>

                    <CssVarsSetter lang={currentLanguage} />

                    <WebSocketProvider host={getAppSetting("socket.host", "localhost")}
                                       port={getAppSettingInt("socket.port", 6401)}
                                       secure={getAppSettingBool("socket.secure", false)}>

                        <Stack direction="row">

                            <Sidebar />

                            <Paper elevation={0} className="MainWrapper" sx={{ flex: 1 }}>

                                <Navbar />

                                <Box sx={{ padding: "0 16px", boxSizing: "border-box", maxWidth: "100vw" }}>

                                    <HashRouter>

                                        <Routes>

                                            <Route path="/" element={<LazySuspense>
                                                <HomePageLazy/>
                                            </LazySuspense>}/>

                                            <Route path="/database" element={<LazySuspense>
                                                <DatabasePageLazy/>
                                            </LazySuspense>}/>

                                            <Route path="/config" element={<LazySuspense>
                                                <ComingSoonNote />
                                            </LazySuspense>}/>

                                            <Route path="/benchmark" element={<LazySuspense>
                                                <BenchmarkPageLazy />
                                            </LazySuspense>}/>

                                        </Routes>

                                    </HashRouter>

                                </Box>

                            </Paper>

                        </Stack>

                        <GlobalSnackbar/>

                    </WebSocketProvider>

                </ThemeContext>

            </ThemeProvider>

        </CacheProvider>
    );
}

function CssVarsSetter() {
    const theme = useTheme();

    return (
        <style>
            {`
        :root {
          --sfd-font: ${theme.typography.fontFamily};
          --sfd-title-font: '${theme.typography.h1.fontFamily}';
          --sfd-primary: ${theme.palette.primary.main};
          --sfd-primary-rgb: ${hexToRgb(theme.palette.primary.main)};
          --sfd-secondary: ${theme.palette.secondary.main};
          --sfd-bg-color: ${theme.palette.background.default};
          --sfd-bg-color-rgb: ${hexToRgb(theme.palette.background.default)};
          --sfd-fg-color: ${theme.palette.background.paper};
          --sfd-fg-color-rgb: ${hexToRgb(theme.palette.background.paper)};
          --sfd-text-color: ${theme.palette.text.primary};
          --sfd-text-color-rgb: ${hexToRgb(theme.palette.text.primary)};
          --sfd-color-error: ${theme.palette.error.main};
          --sfd-color-error-rgb: ${hexToRgb(theme.palette.error.main)};
          --sfd-color-info: ${theme.palette.info.main};
          --sfd-color-info-rgb: ${hexToRgb(theme.palette.info.main)};
          --sfd-color-success: ${theme.palette.success.main};
          --sfd-color-success-rgb: ${hexToRgb(theme.palette.success.main)};
          --sfd-color-warning: ${theme.palette.warning.main};
          --sfd-color-warning-rgb: ${hexToRgb(theme.palette.warning.main)};
          --sfd-color-cyan: #00ACC1;
          --sfd-color-cyan-rgb: #00ACC1;
          --sfd-border-color: rgba(${hexToRgb(theme.palette.text.primary)}, .1);
        }
      `}
        </style>
    );
}

export default App;
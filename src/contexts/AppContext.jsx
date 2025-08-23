import { create } from "zustand";
import { translator } from "../languages/languages.js";
import { getAppSetting, getCookie, LocalDatabase } from "../core/Utils.js";
import { SnowflakeSupportedLanguages } from "../types/SnowflakeLanguageType.js";

let preferredLanguage = getCookie(`${getAppSetting("prefix", "")}lang`);
if(!SnowflakeSupportedLanguages.includes(preferredLanguage))
    preferredLanguage = "en";

/**
 * @type SnowflakeSnackbarType
 */
const snackbarData = {
    isOpen: false,
    autoHideDuration: 5000,
    text: "",
    mobileBottomOffset: 0,
    tabletBottomOffset: 0,
    desktopBottomOffset: 0,
    showIcon: false,
    severity: "info",
    variant: "filled",
    position: {
        horizontal: "center",
        vertical: "bottom"
    }
}

const useAppContext = create((set) => ({
    /**
     * @type {"system"|"light"|"dark"}
     * @since 1.0.0
     */
    themeMode: LocalDatabase.get(LocalDatabase.KEY_THEME_MODE, "system"),
    /**
     * @param {"system"|"light"|"dark"} mode
     * @since 1.0.0
     */
    setThemeMode: mode => set({ themeMode: mode }),
    /**
     * Access token used for authentication
     * @since 1.0.0
     */
    accessToken: LocalDatabase.isExpired(LocalDatabase.KEY_ACCESS_TOKEN) ? null : LocalDatabase.get(LocalDatabase.KEY_ACCESS_TOKEN, null),
    /**
     * Set access token
     * @since 1.0.0
     */
    setAccessToken: token => set(({ accessToken: token })),
    /**
     * @type SnowflakeLanguageType
     * @since 1.0.0
     */
    currentLanguage: preferredLanguage,
    /**
     * @param {SnowflakeLanguageType} lang
     * @since 1.0.0
     */
    setCurrentLanguage: lang => set({ currentLanguage: lang }),
    /**
     * @type {import("react-localization").LocalizedStrings}
     * @since 1.0.0
     */
    l10n: translator,
    snackbar: snackbarData,
    /**
     * @param {SnowflakeSnackbarType} data
     */
    setSnackbar: data => set(state => ({
        snackbar: {
            ...state.snackbar, ...data
        }
    })),
    /**
     * @param {string} text
     * @param {"info"|"success"|"error"|"warning"} severity
     * @param {number} timeout
     * @param {SnowflakeSnackbarType} props
     */
    showSnackbar: (text, severity, timeout = 4000, props = {}) => {
        set(state => ({
            snackbar: {
                ...state.snackbar,
                isOpen: true,
                text,
                severity,
                autoHideDuration: timeout,
                ...props
            }
        }));
    },
    /**
     * @type boolean
     * @since 1.0.0
     */
    sidebarCollapsed: LocalDatabase.getBool(LocalDatabase.KEY_SIDEBAR_COLLAPSED, false),
    /**
     * @param {boolean} collapsed
     * @since 1.0.0
     */
    setSidebarCollapsed: collapsed => {
        LocalDatabase.set(LocalDatabase.KEY_SIDEBAR_COLLAPSED, collapsed ? "1" : "0");
        set({sidebarCollapsed: collapsed});
    },
    /**
     * @type {{loaded: boolean|null, version: string, name: string, encryption: boolean, monitor: boolean, cliPort: number}}
     * @since 1.0.0
     */
    appInfo: {
        loaded: null,
        version: "",
        name: "",
        encryption: false,
        monitor: false,
        cliPort: 0
    },
    /**
     * @param {{loaded: boolean|null, version: string, name: string, encryption: boolean, monitor: boolean, cliPort: number}} info
     * @since 1.0.0
     */
    setAppInfo: info => set({ appInfo: info }),
    /**
     * @type {AccessToken}
     * @since 1.0.0
     */
    currentAccess: null,
    /**
     * @param {null|AccessToken} access
     * @since 1.0.0
     */
    setCurrentAccess: access => set({ currentAccess: access })
}));

export default useAppContext;

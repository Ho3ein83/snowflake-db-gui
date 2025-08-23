import { ChartsLocalizationProvider } from "@mui/x-charts";
import useAppContext from "../contexts/AppContext.jsx";
const faIR= {
    // Overlay
    loading: 'درحال بارگزاری...',
    noData: 'هیچ داده‌ای برای نمایش وجود ندارد',

    // Toolbar
    zoomIn: 'بزرگ‌نمایی',
    zoomOut: 'کوچک‌نمایی',
    toolbarExport: 'خروجی',

    // Toolbar Export Menu
    toolbarExportPrint: 'چاپ',
    // toolbarExportImage: mimeType => `خروجی با پسوند ${imageMimeTypes[mimeType] ?? mimeType}`,
}

export function ChartLocaleProvider({ children }) {

    const currentLanguage = useAppContext(state => state.currentLanguage);

    if(currentLanguage === "fa") {
        return (
            <ChartsLocalizationProvider localeText={faIR}>
                {children}
            </ChartsLocalizationProvider>
        );
    }

    return children;
}

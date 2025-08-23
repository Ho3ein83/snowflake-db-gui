import enLang from "./en.json";
import faLang from "./fa.json";
import LocalizedStrings from "react-localization";
import { enUS } from "@mui/x-data-grid/locales";
import { faIR } from "./dataGridFaIR.js";

export const en = enLang;

export const fa = faLang;

export const languages = {
    en: { ...en, strings: {} },
    fa: { ...fa, strings: {} }
}

export const translator = new LocalizedStrings({
    en: en.strings,
    fa: fa.strings
});

export function getDataGridLocale(language){
    if(language === "fa")
        return faIR.components.MuiDataGrid.defaultProps.localeText;
    return enUS.components.MuiDataGrid.defaultProps.localeText;
}
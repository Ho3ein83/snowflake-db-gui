import useAppContext from "../contexts/AppContext.jsx";
import { useMemo } from "react";
import { sprintf } from "../core/Utils.js";

export default function useTranslate(){

    // logDevAlt("[Reloaded] useTranslate hook");

    const currentLanguage = useAppContext(state => state.currentLanguage);
    const l10n = useAppContext(state => state.l10n);

    const translator = useMemo(() => {

        if(l10n)
            l10n.setLanguage(currentLanguage);

        function __(id, defaultText = null){
            if(Array.isArray(id)){
                if(id.length >= 2)
                    return _n(id[0], [id[1]]);
                return defaultText === null ? id : defaultText;
            }
            return l10n.getString(id) || (defaultText === null ? id : defaultText);
        }

        function _n(id, number){
            const str = l10n.getString((number <= 1 ? "single:" : "plural:") + id);
            return str.replace("%", number);
        }

        function _s(id, ...args){
            return sprintf(__(id), args);
        }

        return ({
            __, _n, _s,
            /**
             * @param {SnowflakeLanguageType} lang
             */
            setLanguage: lang => {
                l10n.setLanguage(lang);
            },
            getLanguage: () => l10n.getLanguage()
        });

    }, [l10n, currentLanguage]);

    return translator;

}
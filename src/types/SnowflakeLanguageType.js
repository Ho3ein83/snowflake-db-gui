/**
 * @typedef {"en"|"fa"} SnowflakeLanguageType
 */

/**
 * @typedef {{ name: string, local_name: string, country: string, local_country: string, strings: object }} SnowflakeLanguageDataType
 */

export const SnowflakeSupportedLanguages = ["en", "fa"];

export const SnowflakeEmptyLanguageData = {
    name: "",
    local_name: "",
    country: "",
    local_country: "",
    strings: {}
};
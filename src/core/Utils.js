export function stringToColor(string, leftBalance = 100, rightBalance = 200) {
    if (typeof string !== "string")
        return "#000000";

    let hash = 0;

    const date = new Date();
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = string.charCodeAt(i) + hash * (date.getMonth() + 1);
    }

    let color = "#";

    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xff;

        // Ensure value is within a visually balanced range
        value = Math.min(rightBalance, Math.max(leftBalance, value)); // Keeps colors from being too bright or dark

        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
}

export function addZero(number) {
    return number < 10 ? `0${number}` : number;
}

export function getCookie(name) {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith(name + "="))
        ?.split("=")[1];
}

export function isRtl(language) {
    return ["fa", "ar"].includes(language);
}

export function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

export function formatNumberWithUnits(number, min = 10000, decimal = 2, separator = " ") {
    if (Math.abs(number) < min) {
        return number.toLocaleString();
    }

    const units = [
        { value: 1e9, symbol: "B" },
        { value: 1e6, symbol: "M" },
        { value: 1e3, symbol: "K" },
    ];

    for (const unit of units) {
        if (Math.abs(number) >= unit.value) {
            const raw = number / unit.value;
            const factor = Math.pow(10, decimal);
            let truncated = Math.floor(raw * factor) / factor;
            let formatted = truncated.toString();
            if (decimal > 0) {
                formatted = truncated.toFixed(decimal).replace(/\.?0+$/, "");
            }
            return `${formatted}${separator}${unit.symbol}`;
        }
    }

    return number.toLocaleString();
}

export function getHashPage() {
    return location.hash.replace("#", "").split("/")[1] ?? "";
}

const devLogsEnabled = getAppSettingBool("render_logs", false);

export const logDev = (...args) => {
    if (devLogsEnabled && import.meta.env.MODE === "development")
        console.log(...args);
}

export const logDevAlt = message => {
    if (devLogsEnabled && import.meta.env.MODE === "development")
        console.log(`   %c${message}`, "color:#f6a04d");
}

export const logDevHigh = message => {
    if (devLogsEnabled && import.meta.env.MODE === "development")
        console.log(`%c${message}`, "color:#039be5");
}

export const logDevLow = message => {
    if (devLogsEnabled && import.meta.env.MODE === "development")
        console.log(` - %c${message}`, "color:#3dda84");
}

export function trimChar(str, charToTrim) {
    if (!str || !charToTrim) return str;

    // Escape special regex characters in charToTrim
    const escapedChar = charToTrim.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Use Unicode-aware regular expression
    const regex = new RegExp(`^(${escapedChar})+|(${escapedChar})+$`, 'gu');

    return str.replace(regex, '');
}

export function scrollToTop() {
    if (typeof window.wrapperElement !== "undefined" && window.wrapperElement) {
        window.wrapperElement.scrollTo({ top: 0, behavior: "smooth" });
    }
    else {
        const el = document.getElementById("dashboard-wrapper");
        if (el) {
            window.wrapperElement = el;
            el.scrollTo({ top: 0, behavior: "smooth" });
        }
    }
}

export function copyToClipboard(text, onSuccess = () => {
}, onFailure = () => {
}) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(onSuccess)
            .catch(onFailure);
    }
    else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-1000px";
        textarea.style.left = "-1000px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand("copy");
            if (successful) {
                onSuccess();
            }
            else {
                onFailure(new Error("execCommand returned false"));
            }
        } catch (err) {
            onFailure(err);
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

export function hexToRgb(hex) {
    // Remove leading #
    hex = hex.replace(/^#/, "");

    // Expand shorthand form (#fff -> #ffffff)
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }

    // Parse the r, g, b values
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `${r}, ${g}, ${b}`;
}

export function convertSize(input, outputFormat = "B", mbMode = false, max = null) {
    const EXP = { "": 0, K: 1, M: 2, G: 3, T: 4, P: 5, E: 6 };

    const toStr = (v) => (typeof v === "number" ? `${v}B` : String(v)).trim();

    // Matches: 123, 123.45 + optional prefix + optional 'i' + 'B'
    // Examples: 4GiB, 512MB, 1024B, 1tb, 2PiB
    const sizePattern = /^\s*(\d+(?:\.\d+)?)\s*([KMGTPE]?)(I)?B\s*$/i;

    const inputStr = toStr(input);
    const im = inputStr.match(sizePattern);
    if (!im) return 0;

    const value = parseFloat(im[1]);
    const inPrefix = (im[2] || "").toUpperCase(); // K, M, G, ...
    const inBinary = !!im[3];                      // presence of 'i'
    const inExp = EXP[inPrefix] ?? 0;

    const bytes = value * Math.pow(inBinary ? 1024 : 1000, inExp);

    if (typeof max === "number")
        return Math.min(bytes, max);

    const outStr = String(outputFormat).trim().toUpperCase();
    const om = outStr.match(/^([KMGTPE]?)(I)?B$/);
    if (!om) return 0;

    const outPrefix = (om[1] || "").toUpperCase();
    const outBinary = om[2] ? true : mbMode; // if user explicitly gave KiB/MiB/... prefer that
    const outExp = EXP[outPrefix] ?? 0;

    const denom = Math.pow(outBinary ? 1024 : 1000, outExp);
    return bytes / denom || 0;
}

export function formatBytes(bytes, binaryMode = false, decimals = 2, spacer = " ", preferredUnits = null) {

    // Negative bytes?
    if (bytes < 0)
        return "N/A";

    // Set the base
    const base = binaryMode ? 1024 : 1000;

    // Set the units based on the size base
    const units = preferredUnits ? preferredUnits : (binaryMode
                  ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"]
                  : ["B", "KB", "MB", "GB", "TB", "PB", "EB"]);

    let unitIndex = 0;

    // As long as 'bytes' is dividable by the base and there are more units to check for
    while (bytes >= base && unitIndex < units.length - 1) {
        bytes /= base;
        unitIndex++;
    }

    const format = `${bytes.toFixed(decimals)}${spacer}${units[unitIndex]}`;

    return decimals === null ? format.replace(".00", "") : format;

}

export function getAppSetting(optionName, defaultValue = null) {
    if (typeof window.SF_CONFIG === "undefined") return defaultValue;

    const parts = optionName.split(".");
    let value = window.SF_CONFIG;

    for (const part of parts) {
        if (value && Object.prototype.hasOwnProperty.call(value, part))
            value = value[part];
        else
            return defaultValue;
    }

    return value ?? defaultValue;
}

export function sinceDate(time){

    if(time === null)
        return "never";

    const diff = time > 0 ? Math.floor((Date.now() - time) / 1000) : 0;
    if(diff < 0)
        return "unknown";

    const days = Math.floor(diff / 86400);

    if(days >= 365){
        const year = Math.floor(days / 365);
        return ["year_ago", year];
    }
    else if(days >= 30){
        const month = Math.floor(days / 30);
        return ["month_ago", month];
    }
    else if(days >= 7){
        const weeks = Math.floor(days / 7);
        return ["week_ago", weeks];
    }
    else if(days >= 1){
        return ["day_ago", days];
    }
    else if(diff >= 3600){
        const hours = Math.floor(diff / 3600);
        return ["hour_ago", hours];
    }
    else if(diff >= 60){
        const minutes = Math.floor(diff / 60);
        return ["minute_ago", minutes];
    }
    else if(diff >= 1){
        return ["second_ago", diff];
    }
    else{
        return "now";
    }

}

export function sprintf(str, ...args) {
    let i = 0;
    return str.replace(/%s/g, () => args[i++]);
}

export function getAppSettingInt(optionName, defaultValue = 0) {
    const value = parseInt(getAppSetting(optionName, defaultValue));
    return isNaN(value) ? defaultValue : value;
}

export function getAppSettingBool(optionName, defaultValue = false) {
    const value = getAppSetting(optionName, defaultValue);
    if(value === "false" || value === "0")
        return false;
    return Boolean(value);
}

export function traverseObject(object, callback){

    let newObject = {};

    for(const key in object){

        // Ensure the property belongs to the object itself, not its prototype chain
        if(Object.prototype.hasOwnProperty.call(object, key)){
            let value = object[key];

            // Apply the callback function to the current key-value pair
            const overwrite = callback(key, value, object);
            if(typeof overwrite !== "undefined")
                value = overwrite;

            // If the value is an object, not null and not an array
            if(typeof value === "object" && value !== null && !Array.isArray(value) && !isBuffer(value)){
                // Recursively call the function for nested objects
                newObject[key] = traverseObject(value, callback);
            }
            else{
                newObject[key] = value;
            }

        }

    }

    return newObject;

}

export function bufferToHex(buffer) {

    // Ensure we have a Uint8Array view
    const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

}

export function bufferFromHex(hex) {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16); // ✅ correct
    }
    return bytes;
}

export function isBuffer(object){
    return object instanceof ArrayBuffer || ArrayBuffer.isView(object);
}

export function visualizeValue(value){

    if(value === null)
        return "Null";

    switch(typeof value){
        case "string":
        case "number":
            return value;
        case "boolean":
            return value ? "True" : "False"
        case "undefined":
            return "Undefined";
    }

    return snowflakeStringify(value);

}

export function snowflakeStringify(input) {

    // Encode arrays and strings using JSON
    if (Array.isArray(input) || typeof input === "string")
        return JSON.stringify(input);

    // Encode the single buffer
    if (isBuffer(input))
        return "0x" + bufferToHex(input);

    // Handle objects
    if (typeof input === "object" && input !== null && !Array.isArray(input)) {

        // Traverse into the object
        const newObject = traverseObject(input, (key, value) => {

            // Mark buffers as string to convert them back to buffer
            if(isBuffer(value))
                return "Buffer#0x" + bufferToHex("hex");

            // Not a buffer, return itself
            return value;

        });

        // Encode the object using JSON
        return JSON.stringify(newObject);

    }

    // Handle literals
    if (input === null)
        return "N";
    if (input === true)
        return "T";
    if (input === false)
        return "F";

    // Anything else, let them handle the conversion
    return input.toString();

}

/**
 * Deserializes a string representation back into its original data type or structured format.
 *
 * @param {string} input - The string input to be parsed.
 * @return {*} - The original data type or structure:
 *  - Returns `null` for 'N' or 'n'.
 *  - Returns `true` for 'T' or 't'.
 *  - Returns `false` for 'F' or 'f'.
 *  - Attempts to parse as JSON, if parsing fails and the input is numeric, converts to `Number`, otherwise returns
 *     as string.
 *  @since 1.0.0
 */
export function snowflakeParse(input) {
    if (input === "N" || input === "n")
        return null;
    if (input === "T" || input === "t")
        return true;
    if (input === "F" || input === "f")
        return false;

    if (typeof input.startsWith === "function" && input.startsWith("0x"))
        return bufferFromHex(input.replace("0x", ""));

    try {

        const json = JSON.parse(input);

        // If it starts with buffer
        if(input.indexOf("Buffer#0x") === 0){
            return traverseObject(json, (key, value) => {
                if (typeof value === "string" && value.startsWith("Buffer#0x"))
                    return this.parse(value.replace("Buffer#", ""));
                return value;
            });
        }

        return json;

        // eslint-disable-next-line
    } catch (error) {

        // If JSON.parse fails, treat it as a primitive value
        if (!isNaN(input))
            return Number(input);

        // Return as string if not a number
        return input;

    }
}

export const LocalDatabase = {
    KEY_SIDEBAR_COLLAPSED: "sidebar_collapsed",
    KEY_THEME_MODE: "theme_mode",
    KEY_ENTRIES_PER_PAGE: "db_entries_per_page",
    KEY_ACCESS_TOKEN: "access_token",
    get: (keyName, defaultValue = null) => {
        const v = localStorage.getItem(keyName);
        return v === null ? defaultValue : v;
    },
    getInt: (keyName, defaultNumber = 0) => {
        const v = parseInt(localStorage.getItem(keyName));
        return isNaN(v) ? defaultNumber : v;
    },
    getBool: (keyName, defaultBool = false) => {
        const v = localStorage.getItem(keyName);
        if (v === "true" || v === "1")
            return true;
        else if (v === "false" || v === "0")
            return false;
        return defaultBool;
    },
    set: (keyName, keyValue) => {
        localStorage.setItem(keyName, keyValue);
    },
    remove: (keyName) => {
        localStorage.removeItem(keyName);
        localStorage.removeItem(`expire:${keyName}`);
    },
    setExpiration: (keyName, expirationInSeconds) => {
        if(expirationInSeconds > 0)
            LocalDatabase.set(`expire:${keyName}`, Date.now() + expirationInSeconds * 1000);
    },
    isExpired: (keyName) => {
        const expiration = LocalDatabase.getInt(`expire:${keyName}`, 0);
        return expiration < 0 || expiration < Date.now();
    }
}
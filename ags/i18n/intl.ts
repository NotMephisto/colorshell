//TODO use I18n system >.<
import en_US from "./lang/en_US";
import pt_BR from "./lang/pt_BR";

import { GLib } from "astal";

const i18nKeys = {
    "en_US": en_US,
    "pt_BR": pt_BR
};

const languages: Array<string> = Object.keys(i18nKeys);

const defaultLanguage: string = languages[0];
let language: string = getSystemLanguage();

export function getSystemLanguage(): string {
    const sysLanguage: (string|null|undefined) = GLib.getenv("LANG") || GLib.getenv("LANGUAGE");

    if(!sysLanguage) {
        console.log(`[WARNING] Couldn't get system language, fallback to default ${defaultLanguage}`);
        console.log("[TIP] Please set the LANG or LANGUAGE environment variable");

        return "en_US";
    }

    return sysLanguage.split('.')[0];
}

export function setLanguage(lang: keyof typeof i18nKeys): string {
    languages.map((cur: string) => {
        if(cur === lang) {
            language = lang;
            return lang;
        }
    });

    throw new Error(`(i18n/intl) Couldn't set language: ${lang}`, {
        cause: `Language ${lang} not found in languages of type ${typeof languages}`
    });
}

export function tr(key: string): string {
    let result = i18nKeys[language as keyof typeof i18nKeys],
        defResult = i18nKeys[defaultLanguage as keyof typeof i18nKeys];

    for(const keyString in key.split('.')) {
        result = result[keyString as keyof typeof result] as never;
        defResult = defResult[keyString as keyof typeof defResult] as never;
    }

    return (result as never) || (defResult as never) || "couldn't find i18n key";
}

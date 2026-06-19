const DICTIONARY_URL = "https://freedictionaryapi.com/api/v1/entries/en/";

// CHECK IF THE WORD IS A VALID WORD IN ENGLISH VIA AN DICTIONARY API
export async function isValidWord(word) {
    try {
        const response = await fetch(DICTIONARY_URL + word.toLowerCase());
        if (!response.ok) return false;
        const data = await response.json();
        return data.entries.length > 0;
    } catch (err) {
        console.error(err);
        return false;
    }
}
const DICTIONARY_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";

// CHECK IF THE WORD IS A VALID WORD IN ENGLISH VIA AN DICTIONARY API
export async function isValidWord(word) {
    try {
        const response = await fetch(DICTIONARY_URL + word.toLowerCase());
        return response.ok;
    } catch (err) {
        console.error(err);
        return false;
    }
}
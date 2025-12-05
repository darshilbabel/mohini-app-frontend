
export function setEncodedLocalStorage(key, value) {
    if (typeof key !== "string") {
        throw new Error("The variable is not a string!");
    }


    const jsonData = JSON.stringify(value);

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(jsonData);

    const encodedString = btoa(String.fromCharCode(...encodedData));

    localStorage.setItem(key, encodedString);
}

export function getEncodedLocalStorage(key) {
    if (typeof key !== "string") {
        throw new Error("The variable is not a string!");
    }

    const encodedString = getEncodedSessionStorage(key);
    if (!encodedString) {
        // console.warn(`No data found in localStorage for key: ${key}`);
        return null;
    }

    try {
        const decodedArray = new Uint8Array(atob(encodedString).split("").map(c => c.charCodeAt(0)));

        const decoder = new TextDecoder();
        const decodedData = decoder.decode(decodedArray);

        const originalData = JSON.parse(decodedData);

        return originalData;

    } catch (error) {
        console.error("Error reading from localStorage:", error.message);
        // throw new Error("Failed to decode or parse the stored data.");
    }
}

export function setEncodedSessionStorage(key, value) {
    if (typeof key !== "string") {
        throw new Error("The variable is not a string!");
    }

    const jsonData = JSON.stringify(value);

    const encoder = new TextEncoder();
    const encodedData = encoder.encode(jsonData);

    const encodedString = btoa(String.fromCharCode(...encodedData));

    sessionStorage.setItem(key, encodedString);
}

export function getEncodedSessionStorage(key) {
    if (typeof key !== "string") {
        throw new Error("The variable is not a string!");
    }

    const encodedString = sessionStorage.getItem(key);
    if (!encodedString) {
        // console.warn(`No data found in sessionStorage for key: ${key}`);
        return null;
    }

    try {
        const decodedArray = new Uint8Array(atob(encodedString).split("").map(c => c.charCodeAt(0)));

        const decoder = new TextDecoder();
        const decodedData = decoder.decode(decodedArray);

        const originalData = JSON.parse(decodedData);

        return originalData;

    } catch (error) {
        console.error("Error reading from sessionStorage:", error.message);
        // throw new Error("Failed to decode or parse the stored data.");
    }
}
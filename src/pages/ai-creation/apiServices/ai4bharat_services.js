import { apiClient as axiosInstance } from "../../../api/client/index";


export async function getAI4BharatAudio(text, language = 'en', gender = 'female') {
    try {
        const response = await axiosInstance.post('api/text_to_speech/', {
            text: text,
            source_language: language,
            gender: gender,
            route: '/mitra-create'
        });

        return response.data.audio;
    } catch (error) {
        console.error('Error fetching AI4Bharat audio:', error);
        throw error;
    }
}

export const handleAI4BharatTTSRequest = async (text, id, language, audioCache, setAudioCache, audioRef, setIsBotTalking) => {

    try {
        let cachedAudioUrl = audioCache[id];
        let audio_result = "";
        let audio;

        if (!cachedAudioUrl) {
            audio_result = await getAI4BharatAudio(text, language);
            if (audio_result?.length) {
                cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
                setAudioCache((prevCache) => ({
                    ...prevCache,
                    [id]: cachedAudioUrl,
                }));
            }
        }

        if (cachedAudioUrl) {
            audioRef.current = new Audio(cachedAudioUrl);
            audio = audioRef.current;

            audio.onended = () => {

                setIsBotTalking(false);
            };
        } else {
            audio_result = await getAI4BharatAudio(text, language);
            if (audio_result?.length) {
                cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
                setAudioCache((prevCache) => ({
                    ...prevCache,
                    [id]: cachedAudioUrl,
                }));
            }
            setIsBotTalking(false);
        }
        try {
            await audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsBotTalking(false);
        }
    } catch (error) {
        console.error('Error in handleAI4BharatTTSRequest:', error);
        setIsBotTalking(false);
    }
};

export async function ai4BharatASR(base64, language, gender = 'female') {

    try {
        const response = await axiosInstance.post('api/asr/', {
            base_64: base64,
            source_language: language,
            gender: gender,
            route: '/mitra-create'
        });

        return response.data.transcript;
    } catch (error) {
        console.error('Error fetching AI4Bharat audio:', error);
        return '';
    }
}


import { getAI4BharatAudioApi } from "api/endpoints/ai";
import { bot_routes } from "configure";

export const handleAI4BharatTTSRequest = async (text, id, language, audioCache, setAudioCache, audioRef, setIsBotTalking) => {

    try {
        let cachedAudioUrl = audioCache[id];
        let audio_result = "";
        let audio;

        if (!cachedAudioUrl) {
            audio_result = await getAI4BharatAudioApi(text, language, bot_routes.mitra_create);
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
            audio_result = await getAI4BharatAudioApi(text, language, bot_routes.mitra_create);
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
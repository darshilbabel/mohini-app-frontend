import { showNotification } from "../components/ToastMessage/TotastMessage";
// import { spokenWordsToDigits } from "../utils/base_utils";
import { ai4BharatASR, getAI4BharatAudio } from "./api.service";
import { getFromStorage, handleS3Upload } from "./storage_service";

export const isSilentAudio = async (blob, silenceThreshold = 0.01) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const rawData = audioBuffer.getChannelData(0);
  
    const rms = Math.sqrt(rawData.reduce((acc, val) => acc + val * val, 0) / rawData.length);
    console.log("RMS (volume):", rms);
  
    return rms < silenceThreshold;
};

export const handleOnSpeaking = async (text, id, sourceLanguage, audioRef, audioCache, setAudioCache, setIsPlaying, storedRoute) => {
    try {
      try {
        if (!!audioRef.current) await audioRef.current.pause();
      } catch (error) {
        console.error({ error });
      }
      console.log("text", text);
      console.log("id", id);
      console.log("sourceLanguage", sourceLanguage);
      console.log("audioRef", audioRef);
    
      handleAI4BharatTTSRequest(
        text,
        id,
        sourceLanguage,
        audioCache,
        audioRef,
        setAudioCache,
        setIsPlaying,
        storedRoute
      )
    } catch (error) {
      console.error({ error });
    }
};

export const handleOnStopSpeaking = async (audioRef, setIsPlaying) => {
    try {
        setIsPlaying(false);
        try {
            if(audioRef.current) await audioRef.current.pause();
        } catch (error) {
            console.error({ error });
        }
    } catch (error) {
        console.error({ error });
    }
};

export const startRecording = (
    setMediaRecorder, setHasStartedRecording, setIsFetchingData, t, setTextMessage, audioRef, setIsPlaying, sourceLanguage, storedRoute, 
    isNumber=false
) => {
    const handleInputChange = ({ value, maxLength }) => {
        let newValue = value.trim();
      
        if (isNumber) {
            const spokenConverted = newValue; //spokenWordsToDigits(newValue);

            // If conversion results in any digit, use it. Else fall back to manual digit cleanup.
            newValue = /\d/.test(spokenConverted) ? spokenConverted : newValue;
            // Remove non-digit characters except spaces
            newValue = newValue.replace(/[^\d ]+/g, '');
            // Remove all spaces to get final numeric value
            newValue = newValue.replace(/\s+/g, '');

            if (maxLength) {
                newValue = newValue.slice(0, maxLength);
            }
        }
        return newValue;
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      handleOnStopSpeaking(audioRef, setIsPlaying);
      setTextMessage('')
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 16000
            };
            const recorder = new MediaRecorder(stream, options);
            setMediaRecorder(recorder);
    
            const localAudioChunks = [];
    
            recorder.start();
            setHasStartedRecording(true);
    
            recorder.ondataavailable = (event) => {
                localAudioChunks.push(event.data);
                
            };
    
            recorder.onstop = async () => {
                
                if (localAudioChunks.length > 0) {
                    const audioBlob = new Blob(localAudioChunks, { type: 'audio/webm;codecs=opus' });
                    const isSilent = await isSilentAudio(audioBlob, 0.02);

                    if (!audioBlob || isSilent) {
                        showNotification({
                        message: t('asrError'),
                        type: "error",
                        options: {
                            position: "top-center",
                            autoClose: 4000,
                            style: { fontWeight: "bold" },
                        },
                        });
                        return;
                    }

                    setIsFetchingData(true);
                    let transcriptResult = '';
                    const sessionId = getFromStorage('sessionid', true);
                    const uniqueId = sessionId 
                        ? `${sessionId}-${Date.now()}` 
                        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                    
                    let s3Url = await handleS3Upload(
                        audioBlob, `${getFromStorage('sessionid', true)}-${Date.now()}`, 'chatbot/companychat/',
                        null
                    );
                    if(!s3Url || s3Url === '') {
                        transcriptResult = t('asrError');
                    }
                    transcriptResult = await ai4BharatASR(s3Url, sourceLanguage, storedRoute);
                    if (!transcriptResult || transcriptResult === '') {
                        showNotification({
                        message: t('asrError'),
                        type: "error",
                        options: {
                            position: "top-center",
                            autoClose: 4000,
                            style: { fontWeight: "bold" },
                        },
                        });
                    } else {
                        const newValue = handleInputChange({ value: transcriptResult, isNumber: true, maxLength: 10 });
                        if (newValue !== '') {
                            setTextMessage(newValue);
                        } else {
                            showNotification({
                                message: t('asrError'),
                                type: "error",
                                options: {
                                    position: "top-center",
                                    autoClose: 4000,
                                    style: { fontWeight: "bold" },
                                },
                            });
                        }
                    }
                    setIsFetchingData(false);
                } else {
                    console.warn("No audio chunks were recorded.");
                    setIsFetchingData(false);
                }
            };
        })
        .catch((err) => {
            console.error('Error accessing microphone:', err);
            setIsFetchingData(false);
        });
    } else {
      console.warn("getUserMedia not supported on your browser!");
    }
};

export const stopRecording = (setHasStartedRecording, mediaRecorder) => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setHasStartedRecording(false);
    }
};

export const handleAI4BharatTTSRequest = async (text, id, sourceLanguage='en', audioCache, audioRef, setAudioCache, setIsPlaying, storedRoute) => {
    try {
        let cachedAudioUrl = (audioCache && id in audioCache) ? audioCache[id] : null;

        let audio_result = "";
        let audio;

        if (!cachedAudioUrl) {
            audio_result = await getAI4BharatAudio(text, sourceLanguage, storedRoute);
            if (audio_result?.length) {
                cachedAudioUrl = `data:audio/wav;base64,${audio_result}`;
                setAudioCache((prevCache) => ({
                    ...prevCache,
                    [id]: cachedAudioUrl,
                }));
            }
        }

        if (cachedAudioUrl) {
            if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; 
            }
            audioRef.current = new Audio(cachedAudioUrl);
            audio = audioRef.current;

            audio.onplay = () => {
            };

            audio.onended = () => {
                setIsPlaying(false);
            };

            try {
                await audio.play();
            } catch (error) {
                console.error('Error playing audio:', error);
            }
        }
    } catch (error) {
        console.error('Error in handleAI4BharatTTSRequest:', error);
        handleOnStopSpeaking(audioRef, setIsPlaying)
    }
};
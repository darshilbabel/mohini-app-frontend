/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate } from "react-router-dom";
import ROUTES from "../../url";
import { useEffect, useRef, useState } from "react";
import FormData from "../../components/Form/FormData";
import { setLanguage } from "../../i18n";
import { useTranslation } from "react-i18next";
import { clearFromStorage, getFromStorage, setInStorage } from "../../services/storage_service";
import { languageList, sessionFlowName } from "../ShikshalokamVoiceChat/enum";
import { handleOnSpeaking, handleOnStopSpeaking } from "../../services/audio_service";
import { HiOutlineSpeakerWave, HiOutlineSpeakerXMark } from "react-icons/hi2";
import "../../components/custom-style.css"
import "../../index.css"
import "./commonPageStyle.css"
import { FaArrowRightLong } from "react-icons/fa6";


function CommonHomePage() {
    const navigate = useNavigate();
    const [userLanguage, setUserLanguage] = useState(
        JSON.parse(localStorage.getItem("local_route")) || languageList[0].value
    );
    const [selectedFlow, setSelectedFlow] = useState(null);
    const [stopAudioTriggered, setStopAudioTriggered] = useState(false);
    const [languageButtonSelect, setLanguageButtonSelect] = useState(getFromStorage('hasSelectedLanguage') || null);

    const { t } = useTranslation();
    const audioRef = useRef();

    
    useEffect(() => {
        if(!languageButtonSelect) {
            localStorage.setItem("local_route", JSON.stringify(languageList[0].value));
            setUserLanguage(languageList[0].value);
        }

        clearFromStorage(true, ['hasSelectedLanguage'])
        if (!localStorage.getItem("local_route")) {
            localStorage.setItem("local_route", JSON.stringify(languageList[0].value));
        }
        setLanguage(userLanguage);

    }, []);

    const handleLanguageChange = (e) => {
        audioRef.current=null;
        setUserLanguage(e?.target?.value);
        setStopAudioTriggered(true);
        stopAllAudio();
        setLanguage(e?.target?.value);
        localStorage.setItem('local_route', JSON.stringify(e?.target?.value));
    };

    const controllerRef = useRef(null);

    async function stopAllAudio(){
        console.log("Stopping all audio in common page: ", audioRef);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (controllerRef.current) {
            controllerRef.current.abort(); // cancel ongoing API
        }
        controllerRef.current = new AbortController();
    }

    return (
        <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 px-0">
            {(languageButtonSelect && ![null, ''].includes(languageButtonSelect))&& 
                <div className="absolute top-6 right-6 min-w-[100px] max-w-fit hidden sm:block">
                    <FormData
                        layOut={2}
                        labelName=""
                        id="pagelanguageID"
                        selectID="pagelanguageID"
                        selectName="language"
                        selectOptions={languageList}
                        labelDivClass="text-left text-slate-700"
                        selectValue={userLanguage}
                        selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-max"
                        selectOnChange={handleLanguageChange}
                    />
                </div>
            }
            <div className="px-5 hidden sm:block">
                <div className="flex">
                    <img
                    src={t('pageLogo')}
                    className="h-[100px] w-[200px] object-contain aspect-auto align-top object-[center_center] relative ml-0"
                    alt="shikshalokam_logo"
                    />
                </div>
                <div className="mt-[40px]">
                    <div className="text-center sm:text-md text-xl mb-2 text-slate-700">
                    <b>{t('welcome_heading1')}</b>
                    </div>
                        {/* {(languageButtonSelect && ![null, ''].includes(languageButtonSelect))&&       
                            <p className="pt-4 pb-0">
                                {t('welcome_paragraph1')}
                            </p>
                        } */}
                </div>
                <img
                    src="https://mohini-static.shikshalokam.org/fe-images/PNG/Shikshalokam/innovationpana-1@2x.png"
                    // width={`${(languageButtonSelect && ![null, ''].includes(languageButtonSelect))? "360": "450"}`}
                    width="360"
                    height="300"
                    className="center-img custom-login-image"
                    alt=""
                />
            </div>
            <div className="w-full px-0">
                <div className="justify-center w-full flex sm:hidden">
                <div className="w-full">
                <div className={`
                    ${(languageButtonSelect && ![null, ''].includes(languageButtonSelect))? 'justify-between' : 'justify-center'}     
                     w-full flex sm:hidden items-center p-2`}>
                    <img
                        src={t('pageLogo')}
                        className={`h-[50px] object-contain ${userLanguage === 'en'? 'w-[140px]': 'w-[100px] '}`}
                        alt="shikshalokam_logo"
                    />
                    {(languageButtonSelect && ![null, ''].includes(languageButtonSelect))&&       
                        <div className="w-[140px] flex justify-end p-2">
                            <FormData
                                layOut={2}
                                labelName=""
                                id="pagelanguageID"
                                selectID="pagelanguageID"
                                selectName="language"
                                selectOptions={languageList}
                                labelDivClass="text-left text-slate-700"
                                selectValue={userLanguage}
                                selectClassName="bg-white text-slate-600 rounded-3xl p-3 mt-0 outline outline-slate-300 outline-1 outline-offset min-w-0 w-full"
                                selectOnChange={handleLanguageChange}
                            />
                        </div>
                    }
                    </div>

                </div>
                </div>
                <div className="sm:hidden text-center sm:text-sm mb-1 text-md text-slate-700">
                    <b>{t('welcome_heading1')}</b>
                </div>
                <img
                    src="https://mohini-static.shikshalokam.org/fe-images/PNG/Shikshalokam/innovationpana-1@2x.png"
                    width="170"
                    height="100"
                    className="center-img custom-login-image sm:hidden"
                    alt=""
                />
                <div className="bg-slate-50 sm:pt-6 sm:h-[100%] flex flex-col justify-center mt-0 w-full">
                    <div className="flex justify-end mr-6 relative block sm:hidden">
                    </div>
                    <div className="sm:hidden">
                        {/* {(languageButtonSelect && ![null, ''].includes(languageButtonSelect))&&       
                            <p className="pt-1 pb-4 text-center">
                                {t('welcome_paragraph1')}
                            </p>
                        } */}
                    </div>
                    <>
                        <div className="text-center text-lg md:text-2xl sm:text-md mt-0 sm:mt-[100px] text-slate-700">
                            <b>{t('welcome_text')}</b>
                        </div>
                    </>
                    {(languageButtonSelect && ![null, ''].includes(languageButtonSelect))? 
                        <div className="py-2 px-2 text-center">
                            {/* Form here */}
                            <div className="flex flex-col items-center gap-8 py-6 px-0 font-inter">
                                {/* Top Buttons */}
                                <div className="flex w-full justify-center flow-button-custom">
                                    <span 
                                        className={`flex items-center gap-3 px-3 sm:py-4 py-4 rounded-2xl text-[#322f2f] cursor-pointer 
                                            ${selectedFlow == sessionFlowName.GuestMiStory? 'bg-[#efeafe]': 'bg-[#e3ecf48f]'} max-w-[210px] w-full`
                                        }
                                        onClick={() => {
                                            setSelectedFlow(sessionFlowName.GuestMiStory);
                                        }}
                                    >
                                        <span className="text-base font-medium">
                                            <ShowPageButton
                                                text={t('commonPageButtonText1')}
                                                id="capture-mi-story"
                                                userLanguage={userLanguage}
                                                showSpeaker={true}
                                                forcePlayAudio={selectedFlow === sessionFlowName.GuestMiStory}
                                                selectedFlow={selectedFlow}
                                                audioRef={audioRef}
                                                stopAudioTriggered={stopAudioTriggered}
                                                setStopAudioTriggered={setStopAudioTriggered}
                                                controllerRef={controllerRef}
                                            />
                                        </span>
                                    </span>
                                    <span 
                                        className={`flex items-center gap-3 px-3 sm:py-6 py-4 rounded-2xl text-[#322f2f] cursor-pointer 
                                            ${selectedFlow == sessionFlowName.GuestDiscussion? 'bg-[#efeafe]': 'bg-[#e3ecf48f]'} max-w-[210px] w-full`
                                        }
                                        onClick={() => {
                                            setSelectedFlow(sessionFlowName.GuestDiscussion);
                                        }}
                                    >
                                        <span className="text-base font-medium">
                                            <ShowPageButton
                                                text={t('commonPageButtonText2')}
                                                id="capture-discussion"
                                                userLanguage={userLanguage}
                                                showSpeaker={true}
                                                forcePlayAudio={selectedFlow === sessionFlowName.GuestDiscussion}
                                                selectedFlow={selectedFlow}
                                                audioRef={audioRef}
                                                stopAudioTriggered={stopAudioTriggered}
                                                setStopAudioTriggered={setStopAudioTriggered}
                                                controllerRef={controllerRef}
                                            />
                                        </span>
                                    </span>
                                </div>

                                {/* Continue Button */}
                                <button
                                    className={`mt-2 px-16 py-2 rounded-xl text-white text-lg font-medium flex items-center ${selectedFlow? 'bg-[#572E91] cursor-pointer': 'bg-[#8d888857] cursor-not-allowed'}`}
                                    disabled={!selectedFlow}
                                    onClick={async () => {
                                        await stopAllAudio();
                                        if(selectedFlow === sessionFlowName.GuestDiscussion) {
                                            console.log("previousUrl", window.location.href);
                                            setInStorage('previousUrl', window.location.href)
                                            setInStorage('tempCode', 'xyz123');
                                            if(getFromStorage('previousUrl')) {
                                                navigate(ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT);
                                                window.location.reload();
                                            }
                                        } else if(selectedFlow === sessionFlowName.GuestMiStory) {
                                            setInStorage('previousUrl', window.location.href)
                                            setInStorage('tempCode', 'xyz123');
                                            if(getFromStorage('previousUrl')) {
                                                navigate(ROUTES.SHIKSHALOKAM_GUEST_MI_STORY);
                                                window.location.reload();
                                            }
                                        }
                                    }}
                                >
                                    {t('continueBtnText')} <FaArrowRightLong className="ml-2 text-xl"/>
                                </button>
                            </div>
                        </div>
                    :
                    <>
                        <p className="sm:text-xl text-md font-semibold text-center">{t('languageQuestion')}</p>
                        <div className="mt-4 mb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:justify-items-center lg:px-[80px] md:px-[20px] sm:px-[20px] px-[10px]">
                            {languageList.map((lang) => (
                                <div key={lang.value} className="div14-lang w-full text-center vertical-center m-0 h-[100px] flex items-center justify-center">
                                    <button className="w-full" 
                                        onClick={() => {
                                            setInStorage('hasSelectedLanguage', true);
                                            setLanguageButtonSelect(lang.value);
                                            setUserLanguage(lang.value);
                                            setStopAudioTriggered(true);
                                            stopAllAudio();
                                            setLanguage(lang.value);
                                            localStorage.setItem('local_route', JSON.stringify(lang.value));
                                        }}
                                    >
                                        {lang.label}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                    }
                </div>
            </div>
        </div>
    );
}

export default CommonHomePage;

export function ShowPageButton({text, id, audioRef, stopAudioTriggered, setStopAudioTriggered, controllerRef, userLanguage='en', selectedFlow, showSpeaker=false, forcePlayAudio=false}){

    const [audioCache, setAudioCache] = useState({});

    const [isPlaying, setIsPlaying] = useState(false);
    const hasForcedPlay = useRef(1);
    const prevFlow = useRef(null);

    useEffect(()=>{
        setAudioCache({});
        audioRef.current=null;
        hasForcedPlay.current = 2;
        prevFlow.current = selectedFlow;
    }, [userLanguage])


    useEffect(() => {
        if (prevFlow.current !== selectedFlow) {
            setIsPlaying(false);
            hasForcedPlay.current = 1;
            prevFlow.current = selectedFlow;
        }
    }, [selectedFlow]);

     useEffect(() => {
        if (forcePlayAudio && !isPlaying && text && hasForcedPlay.current === 1) {
            hasForcedPlay.current = 2;
            setStopAudioTriggered(false);
            setIsPlaying(true);
            handleOnSpeaking(text, id, userLanguage, audioRef, audioCache, setAudioCache, setIsPlaying)
        }
    }, [forcePlayAudio, text, id, isPlaying, audioCache]);

    useEffect(() => {
        if (stopAudioTriggered) {
            console.log("Stopping audio due to stopAudioTriggered");
            setIsPlaying(false);
        }
    }, [stopAudioTriggered]);

    return (
        <div className={`flex items-center gap-2 vertical-center`}>
            {showSpeaker && (
                <span className="speaker-div vertical-center">
                    {isPlaying ? (
                        <button
                            type="button"
                            className="speaker-off-button text-[1.3rem] md:text-lg sm:text-[1.3rem] text-[#322f2f] vertical-center"
                            onClick={(e) => {
                                console.log("Has forced play: ", hasForcedPlay.current);
                                console.log("forcePlayAudio: ", forcePlayAudio);
                                // e.stopPropagation();
                                if(!forcePlayAudio) {
                                    handleOnStopSpeaking(audioRef, setIsPlaying)
                                }
                            }}
                        >
                            <HiOutlineSpeakerWave />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="speaker-off-button text-[1.3rem] md:text-lg sm:text-[1.3rem] vertical-center"
                            onClick={(e) => {
                                forcePlayAudio = false;
                                console.log("Has forced play: ", hasForcedPlay.current);
                                console.log("forcePlayAudio: ", forcePlayAudio);
                                // e.stopPropagation();
                                if(!forcePlayAudio && hasForcedPlay.current !== 1) {
                                    setStopAudioTriggered(false);
                                    setIsPlaying(true);
                                    handleOnSpeaking(text, id, userLanguage, audioRef, audioCache, setAudioCache, setIsPlaying)
                                }
                            }}
                        >
                            <HiOutlineSpeakerXMark />
                        </button>
                    )}
                </span>
            )}
            <label htmlFor={id} className="text-[1rem] md:text-md sm:text-[1rem]">
                {text}
            </label>
        </div>
    );
}
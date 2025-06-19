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


function CommonHomePage() {
    const navigate = useNavigate();
    const [userLanguage, setUserLanguage] = useState(
        JSON.parse(localStorage.getItem("local_route")) || languageList[0].value
    );
    const [selectedFlow, setSelectedFlow] = useState(null);

    const { t } = useTranslation();
    
    useEffect(() => {
        clearFromStorage(true)
        if (!localStorage.getItem("local_route")) {
            localStorage.setItem("local_route", JSON.stringify(languageList[0].value));
        }
        setLanguage(userLanguage);

    }, []);

    const handleLanguageChange = (e) => {
        setUserLanguage(e?.target?.value);
        setLanguage(e?.target?.value);
        localStorage.setItem('local_route', JSON.stringify(e?.target?.value));
    };

    return (
        <div className="container max-w-full md mt-0 mx-auto grid md:grid-cols-2 justify-center">
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
            <div className="px-5 hidden sm:block">
                <div className="flex">
                    <img
                    src={t('pageLogo')}
                    className="h-[100px] w-[200px] object-contain aspect-auto align-top object-[center_center] relative ml-0"
                    alt="shikshalokam_logo"
                    />
                </div>
                <div className="mt-[40px]">
                    <div className="text-left sm:text-2xl text-md text-slate-700">
                    <b>{t('welcome_heading1')}</b>
                    </div>
                    <p className="pt-4 pb-4">
                    {t('welcome_paragraph1')}
                    </p>
                </div>
                <img
                src="https://mohini-static.shikshalokam.org/fe-images/PNG/Shikshalokam/innovationpana-1@2x.png"
                width="500"
                height="900"
                className="center-img custom-login-image"
                alt=""
                />
            </div>
            <div className="">
                <div className="justify-center w-full flex sm:hidden">
                <div className="w-full">
                <div className="justify-between w-full flex sm:hidden items-center p-2">
                    <img
                        src={t('pageLogo')}
                        className="h-[80px] w-[100px] object-contain"
                        alt="shikshalokam_logo"
                    />
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
                    </div>

                </div>
                </div>
                <div className="sm:hidden text-center sm:text-2xl text-xl mb-6 text-md text-slate-700">
                    <b>{t('welcome_heading1')}</b>
                    </div>
                <img
                src="https://mohini-static.shikshalokam.org/fe-images/PNG/Shikshalokam/innovationpana-1@2x.png"
                width="200"
                height="100"
                className="center-img custom-login-image sm:hidden"
                alt=""
                />
                <div className="bg-slate-50 sm:pt-6 sm:h-[100%]">
                    <div className="flex justify-end mr-6 relative block sm:hidden">
                    </div>
                    <div className="mt-[50px] sm:hidden">
                    <p className="pt-1 pb-4 text-center">
                    {t('welcome_paragraph1')}
                    </p>
                </div>
                    <>
                    <div className="text-center sm:text-2xl text-2xl mt-[30px] sm:mt-[100px] text-slate-700">
                        <b>{t('welcome_text')}</b>
                    </div>
                    </>
                <div className="py-2 px-0 text-center">
                    {/* Form here */}
                    <div className="flex flex-col items-center gap-8 py-6 px-0 font-inter">
                        {/* Top Buttons */}
                        <div className="flex gap-6">
                            <span className={`flex items-center gap-3 px-3 sm:py-6 py-4 rounded-2xl text-[#322f2f] cursor-pointer ${selectedFlow == sessionFlowName.GuestMiStory? 'bg-[#efeafe]': 'bg-[#e3ecf48f]'} `}
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
                                    />
                                </span>
                            </span>
                            <span className={`flex items-center gap-3 px-3 sm:py-6 py-4 rounded-2xl text-[#322f2f] cursor-pointer ${selectedFlow == sessionFlowName.GuestDiscussion? 'bg-[#efeafe]': 'bg-[#e3ecf48f]'} `}
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
                                    />
                                </span>
                            </span>
                        </div>

                        {/* Continue Button */}
                        <button
                            className={`mt-2 px-16 py-2 rounded-xl text-white text-lg font-medium ${selectedFlow? 'bg-[#572E91] cursor-pointer': 'bg-[#8d888857] cursor-not-allowed'}`}
                            disabled={!selectedFlow}
                            onClick={() => {
                                console.log("selectedFlow", selectedFlow);
                                if(selectedFlow === sessionFlowName.GuestDiscussion) {
                                    console.log("previousUrl", window.location.href);
                                    setInStorage('previousUrl', window.location.href)
                                    setInStorage('tempCode', 'xyz123');
                                    if(getFromStorage('previousUrl')) {
                                        navigate(ROUTES.SHIKSHALOKAM_GUEST_VOICE_CHAT);
                                    }
                                } else if(selectedFlow === sessionFlowName.GuestMiStory) {
                                    setInStorage('previousUrl', window.location.href)
                                    setInStorage('tempCode', 'xyz123');
                                    if(getFromStorage('previousUrl')) {
                                        navigate(ROUTES.SHIKSHALOKAM_GUEST_MI_STORY);
                                    }
                                }
                            }}
                        >
                            {t('continueBtnText')}
                        </button>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}

export default CommonHomePage;

export function ShowPageButton({text, id, userLanguage='en', selectedFlow, showSpeaker=false, forcePlayAudio=false}){

    const audioRef = useRef();
    const [audioCache, setAudioCache] = useState({});

    const [isPlaying, setIsPlaying] = useState(false);
    const hasForcedPlay = useRef(1);
    const prevFlow = useRef(null);

    useEffect(()=>{
        setAudioCache({});
        audioRef.current=null;
        hasForcedPlay.current = 1;
        prevFlow.current = selectedFlow;
    }, [userLanguage])


    useEffect(() => {
        if (prevFlow.current !== selectedFlow) {
            hasForcedPlay.current = 2;
            prevFlow.current = selectedFlow;
        }
    }, [selectedFlow]);

     useEffect(() => {
        if (forcePlayAudio && !isPlaying && text && hasForcedPlay.current === 2) {
            console.log("Flow changed, resetting audio state");
            hasForcedPlay.current = 3;
            setIsPlaying(true);
            handleOnSpeaking(text, id, userLanguage, audioRef, audioCache, setAudioCache, setIsPlaying);
        }
    }, [forcePlayAudio, text, id, isPlaying, audioCache]);


    return (
        <div className={`flex items-center gap-2`}>
            {showSpeaker && (
                <span className="speaker-div">
                    {isPlaying ? (
                        <button
                            type="button"
                            className="speaker-off-button text-[#322f2f]"
                            onClick={() => handleOnStopSpeaking(audioRef, setIsPlaying)}
                        >
                            <HiOutlineSpeakerWave />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="speaker-off-button"
                            onClick={() => {
                                setIsPlaying(true);
                                handleOnSpeaking(text, id, userLanguage, audioRef, audioCache, setAudioCache, setIsPlaying);
                            }}
                        >
                            <HiOutlineSpeakerXMark />
                        </button>
                    )}
                </span>
            )}
            <label htmlFor={id} className="">
                {text}
            </label>
        </div>
    );
}
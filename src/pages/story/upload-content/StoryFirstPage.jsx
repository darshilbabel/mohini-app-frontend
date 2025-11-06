import React, { useEffect, useState } from "react";
import Cookies from "universal-cookie";
import { stateLabelArray } from "../../../shikshalokam-field-data";
import "../../../storyPdf.css";

function StoryFirstPage(props){

    useEffect(()=>{
        const currentState = props.currentState;
    }, [])

    return(
        (props.currentState === 'Nagaland')?
            <div className="story-company-div-fmt1 no-page-break">
                <div className="story-logo-div">
                    <p className="story-company-text-fmt1">Micro-Improvement</p>
                    <p className="story-title-fmt1">{props.title}</p>
                    <img src="/images/pdf_page1_logo_fmt1.png" className="story-bg1-fmt1" alt="pdf_bg1"></img>
                    <p className="story-author-fmt1">{props.author}</p>
                    <p className="story-school-fmt1">{props.schoolName}</p>
                    <img src="/images/nagaland_govt_logo.png" className="story-logo-fmt1" alt="pdf_bg1"></img>
                    <img src="/images/nagaland_samagra_logo.png" className="story-logo1-fmt1" alt="pdf_bg1"></img>
                    <img src="/images/shikshalokam_logo_pdf.png" className="story-logo2-fmt1" alt="pdf_bg1"></img>
                    <img src="/images/shikshalokam_logo_pdf.png" className="story-logo3-fmt1" alt="pdf_bg1"></img>
                </div>
            </div>
            :
            <div className={`${(props.currentState === stateLabelArray[2]?.state) ? 
                'story-company-div1' : 'story-company-div'} no-page-break`
                }
            >
                <div className= {`${(props.currentState === stateLabelArray[2]?.state) ? 
                    'story-logo-div1' : 'story-logo-div'}`
                    } 
                >
                    {
                        (props.currentState === stateLabelArray[2]?.state) ?
                        <>
                            <img src='/images/shikshalokam_logo_pdf.png' className="story-company-logo1" alt="company_logo" />
                            <img src='/images/shikshalokam_logo_pdf.png' className="story-shikshalokam-logo" alt="company_logo" />
                            <img src='/images/Govt_of_Haryana-Logo.png' className="story-govt-logo" alt="Govt_of_Haryana-Logo" />
                            <img src='/images/SCERT_Haryana-Logo.png' className="story-haryana-logo" alt="SCERT_Haryana-Logo.png" />
                        </> :
                        <img src={props.companyLogo} className="story-company-logo-First" alt="company_logo" />
                    }
                </div>
                <div>
                    <img src="/images/pdf_bg0.png" className="story-bg0" alt="pdf_bg0"></img>
                    <img src="/images/pdf_bg1.png" className="story-bg1" alt="pdf_bg1"></img>
                    <img src="/images/pdf_bg2.png" className="story-bg2" alt="pdf_bg2"></img>
                </div>
                <div>
                    <p className="story-title">{props.title}</p>
                    <p className="story-author">{props.author}</p>
                    <a href="https://demo.shikshalokam.org" className="story-link">https://demo.shikshalokam.org</a>
                </div>
            </div>
    );

}

export default StoryFirstPage;
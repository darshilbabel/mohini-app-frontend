import React from "react";

function StoryFifthCard(props){
    let points = props.content;
    if (typeof points === 'string') {
        try {
            let jsonString = points.replace(/'/g, '"');
            points = JSON.parse(jsonString);
        } catch (error) {
            points = points?.split(/\d+\./).filter(Boolean);
        }
    }
     
    return(
        <>
                <div className={props.cardClass}>
                    <img src="/images/star.svg" className="story-shikshaLokam-star" alt="star-logo" />
                    <p className="story-shikshaLokam-card-heading">{props.heading}</p>
                    {(points && points.length===1)&&<p className="story-shikshaLokam-card-content">{points}</p>}
                        {points && points.length > 1 && (
                            <ul className="story-shikshaLokam-card-content">
                                {points?.map((point, index) => (
                                    <li key={index}>{`${index + 1}. ${point.trim()}`}</li>
                                ))}
                            </ul>
                        )}
                    <div className="story-shikshaLokam-card-line"></div>
                </div>
        </>
    );

}

export default StoryFifthCard;
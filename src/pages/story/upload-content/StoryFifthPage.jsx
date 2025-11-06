import React, { useEffect } from "react";
import StoryFifthCard from "./StoryFifthCard";
import "../../../storyPdf.css";

function StoryFifthPage({
  action_steps,

  impact,

  micro_improvement,
  objective,
}) {

  return (
    <div className="story-shikshaLokam-div no-page-break">
      <div className="story-fifthpage-wrapper">
        <p className="story-shikshaLokam-heading">MICRO IMPROVEMENT REPORT</p>
        <img src="/images/line_story.png" className="shikshalokam-line-logo" alt="line_story" />
        <div className="story-cards-wrapper">
          <StoryFifthCard
            cardClass="story-shikshaLokam-card"
            heading="Objective"
            content={objective}
          />
          <StoryFifthCard
            cardClass="story-shikshaLokam-card"
            heading="Micro Improvement"
            content={micro_improvement}
          />
          <StoryFifthCard
            cardClass="story-shikshaLokam-card"
            heading="Impact"
            content={impact}
          />
          <StoryFifthCard
            cardClass="story-shikshaLokam-card"
            heading="Action Steps"
            content={action_steps}
          />
        </div>
      </div>
      
    </div>

  );
}

export default StoryFifthPage;
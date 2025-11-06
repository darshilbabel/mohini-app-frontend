import React from "react";
import DOMPurify from "dompurify";
import "../../../storyPdf.css";

function StoryThirdPage({ fontSize, content2, tweet, shouldShowStoryHeading, title }) {
  let sanitizedContent = DOMPurify.sanitize(content2);
  function showTweet(){
    if(!tweet) return;
    return(
      <>
        <img
          src="/images/line_story.png"
          className="story-line1-logo"
          alt="line_story"
        ></img>
        <div className="story-tweet-box1 textBox-autoresizing">
          <img
            src="/images/twitter_logo.png"
            className="story-twitter-logo"
            alt="twitter_logo"
          ></img>
          <p className="story-tweet">{tweet}</p>
        </div>
        </>
    );
  }

  return (
    <div className="story-company2-div no-page-break">
      {shouldShowStoryHeading&& 
        <>
          <p className="story-heading-third">{title? title:'STORY'}</p>
          <img
            src="/images/line_story.png"
            className="story-line-logo1-third"
            alt="line_story"
          />
        </>
      }
      <div className="story-contentBox">
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          style={{
            position: "relative",
            width: "680px",
            height: "auto",
            fontFamily: "'Open Sans', sans-serif",
            fontStyle: "normal",
            fontSize: fontSize,
            lineHeight: "28px",
            color: "#000000",
            textAlign: "justify",
          }}
        />
        {showTweet()}
      </div>
    </div>
  );
}

export default StoryThirdPage;
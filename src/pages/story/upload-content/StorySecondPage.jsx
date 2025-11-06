import React from "react";
import DOMPurify from "dompurify";
import "../../../storyPdf.css";

function StorySecondPage({ fontSize, images, content1, tweet, imgPerPage, title}) {

  function showTweet() {
    if (tweet) {
      return (
        <div className="story-tweet1-div">
          <img
            src="/images/line_story.png"
            className="story-line1-logo1"
            alt="line_story"
          />
          <div className="story-tweet-box textBox-autoresizing">
            <img
              src="/images/twitter_logo.png"
              className="story-twitter-logo"
              alt="twitter_logo"
            ></img>
            <p className="story-tweet1">{tweet}</p>
          </div>
        </div>
      );
    }
  }

  function addData() {
    let sanitizedContent = DOMPurify.sanitize(content1);
    const hasImage = !!images?.length;
    const numberOfImage = images?.length || 0;

    if (hasImage && numberOfImage !== imgPerPage) {
      return (
        <div className="story-contentBox1" style={{
          left: '0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Image ${index + 1}`} className="story-bg3" style={{
              position: "relative",
              padding: "0 0 29px 0",
              width: 'auto',
              height: 'auto',
              maxWidth: "183mm",
              maxHeight: "123.35mm"
            }} />
          ))}
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            style={{
              position: "relative",
              width: "680px",
              height: "auto",
              top: "50px",
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
      );
    } else if (hasImage && numberOfImage === imgPerPage){
      return (
        <div className="story-contentBox1" style={{
          left: '0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Image ${index + 1}`} className="story-bg3" style={{
              position: "relative",
              padding: "0 0 29px 0",
              width: 'auto',
              height: 'auto',
              maxWidth: "183mm",
              maxHeight: "123.35mm"
            }} />
          ))}
          </div>
      );
          
    } else {
      return (
        <div className="story-contentBox1" style={{
          left: '0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <div
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            style={{
              position: "relative",
              width: "680px",
              height: "auto",
              top: "0",
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
      );
    }
  }

  return (
    <div className="story-company1-div no-page-break">
      <p className="story-heading">{title? title:'STORY'}</p>
      <img
        src="/images/line_story.png"
        className="story-line-logo1"
        alt="line_story"
      />
      {addData()}
    </div>
  );
}

export default StorySecondPage;
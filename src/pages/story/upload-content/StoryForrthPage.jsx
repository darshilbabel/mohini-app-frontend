import React from "react";
import "../../../storyPdf.css";

function StoryFourthPage({ images }) {
  function addData() {
    const hasImages = !!images.length;
    if (hasImages) {
      return images.map((image, index) => (
        <div
          key={index + " " + image}
          className="story-shikshaLokam-contentBox"
        >
          <img
            src={`${image}`}
            className="my-4"
            alt="story-user-upload-img"
            crossOrigin="true"
            style={{
              position: "relative",
              width: "500px",
              height: "auto",
            }}
          />
        </div>
      ));
    }
  }

  return (
    <div className="story-company4-div">
      <p className="story-shikshaLokam-heading">MICRO IMPROVEMENT REPORT</p>
      <img
        src="/images/line_story.png"
        className="shikshalokam-line-logo"
        alt="line_story"
      />
      {addData()}
    </div>
  );
}

export default StoryFourthPage;
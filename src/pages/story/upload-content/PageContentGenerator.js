function pageContentGenerator(type, content, fontSize, index) {
  const applied_class =
    content?.text?.length > 100 ? "story-shikshaLokam-div" : " pb-5";

  switch (type) {
    case type_of_content.image:
      return (
        <div className="mx-auto text-center flex w-full justify-center story-shikshaLokam-div">
          <img
            src={`${content?.url}`}
            className="my-4"
            alt="story-user-upload-img"
            crossOrigin="true"
            style={{
              position: "relative",
              width: "auto",
              height: "400px",
            }}
          />
        </div>
      );

    case type_of_content.paragraph:
      return (
        <div
          className={
            "mx-auto text-center flex w-full justify-center " + applied_class
          }
        >
          <div
            dangerouslySetInnerHTML={{ __html: content?.text }}
            style={{
              position: "relative",
              width: "680px",
              height: "auto",
              fontFamily: "'Inter'",
              fontStyle: "normal",
              fontSize: fontSize,
              lineHeight: "28px",
              color: "#000000",
              textAlign: "justify",
            }}
          />
        </div>
      );
    default:
      return (
        <div
          className={
            "mx-auto text-center flex w-full justify-center " + applied_class
          }
        >
          <div
            dangerouslySetInnerHTML={{ __html: content?.text }}
            style={{
              position: "relative",
              width: "680px",
              height: "auto",
              fontFamily: "'Inter'",
              fontStyle: "normal",
              fontSize: fontSize,
              lineHeight: "28px",
              color: "#000000",
              textAlign: "justify",
            }}
          />
        </div>
      );
  }
}

export default pageContentGenerator;

const type_of_content = {
  image: "image",
  paragraph: "paragraph",
};

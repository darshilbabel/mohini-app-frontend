import React, { useState, useEffect } from "react";
import Header from "../../../shikshagraha-repository/listing/Header";
import Footer from "../../../shikshagraha-repository/common/Footer";
import FileViewer from "../../components/file-viewer";
import { useParams } from "react-router-dom";
import { useAICreationSessionStore } from "store";
import Notification from "../../../../components/ToastMessage/TotastMessage";

const ImprovementPlan = () => {
  const [media, setMedia] = useState([]);
  const { projectId } = useParams();
  const items = useAICreationSessionStore.getState().getMedia()

  useEffect(() => {
    const mediaItems = items || [];
    setMedia(mediaItems);
  }, [projectId]);


  return (
    <>
    <div className="container max-w-[1500px] h-full mx-auto py-3">
      <Notification />
      <Header
        isHeroSection={false}
        isBackButton={true}
      />
      <main className="w-full h-fit mb-10">
        <FileViewer url={media[0]?.url} fileName={media[0]?.file_name} fileType={media[0]?.media_type} />
      </main>
    </div>
      <Footer />
      </>
    

  );
};

export default ImprovementPlan;

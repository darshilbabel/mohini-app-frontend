import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../../shikshagraha-repository/common/Footer";
import FileViewer from "../../components/file-viewer";
import { useParams } from "react-router-dom";
import { useAICreationSessionStore } from "store";

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
      <Header isBackButton={true} isHeroSection={false} />
      <main className="w-screen h-fit mb-10">
        <FileViewer url={media[0]?.url} fileName={media[0]?.file_name} fileType={media[0]?.media_type} />
      </main>
      <Footer />
    </>
  );
};

export default ImprovementPlan;

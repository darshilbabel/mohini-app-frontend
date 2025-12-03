import React, { useState, useEffect } from "react";
import Header from "../../../shikshagraha-repository/listing/Header";
import Footer from "../../../shikshagraha-repository/common/Footer";
import FileViewer from "../../components/file-viewer";
import { getEncodedSessionStorage } from "../../utils/storage_utils";
import { useParams } from "react-router-dom";

const ImprovementPlan = () => {
  const [media, setMedia] = useState([]);
  const { projectId } = useParams();

  useEffect(() => {
    const mediaItems = getEncodedSessionStorage("media") || [];
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

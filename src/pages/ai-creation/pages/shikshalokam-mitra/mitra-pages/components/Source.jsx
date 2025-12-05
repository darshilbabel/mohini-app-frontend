import React, { useMemo, useState } from "react";
import Card from "../../../../../../components/cards/Card";
import Collapse from "../../../../../../components/Collapse/Collapse";
import Tabs from "../../../../../../components/Tabs/Tabs";
import SourcePopup from "./SourcePopup";

const Source = ({ source = {}, customClassNames = {} }) => {

  console.log("SOURCE", source)
  const [isOpenSourcePopup, setIsOpenSourcePopup] = useState(false);
  const [sourcePopupData, setSourcePopupData] = useState({});
  const showSourceTabs = useMemo(() => {
    return Object.keys(source || []).length > 0;
  }, [source]);

  console.log({source})

  const tabTitles = useMemo(() => {
    return Object.keys(source || []);
  }, [source]);

  const TabBody = (sourceData) => {

    console.log({sourceData})
    if (!Array.isArray(sourceData) || sourceData.length === 0) {
      return <div>No sources available</div>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-4 mt-[10px] lg:mt-0">
        {sourceData.map((item, index) => {

          console.log({item})
          const sources = item?.sources || [];
          const sourceUrls = sources?.map(source => source?.url)
          return (
            <Card
              key={`${item?.text}-${index}`}
              label={item?.reference || ""}
              title={item?.text || ""}
              description={source?.description || ""}
              sourceUrls={sourceUrls || []}
              show={source?.chunk}
              showSourcePopup={() => {
                setSourcePopupData({
                  sourcesList: sources,
                  label: item?.reference || "",
                });
                setIsOpenSourcePopup(true);
              }}
            />
          );
        })}
      </div>
    );
  };

  const tabs = useMemo(() => {
    if (
      !source ||
      Object.keys(source).length === 0 ||
      !tabTitles ||
      tabTitles?.length === 0
    ) {
      return [];
    }
    return tabTitles?.map((organizationKey) => ({
      label: organizationKey,
      content: TabBody(source[organizationKey] || []),
    }));
  }, [tabTitles, source]);

  if (!showSourceTabs) return null;

  console.log({sourcePopupData})


  return (
    <>
      <Collapse
        title="Source"
        defaultOpen={false}
        customClassNames={customClassNames}
      >
        <Tabs tabs={tabs} />
      </Collapse>
      <SourcePopup
        isOpen={isOpenSourcePopup}
        onClose={() => {
          console.log("going here")
          setIsOpenSourcePopup(false);
          setSourcePopupData({});
        }}
        sourcesData={sourcePopupData}
      />
    </>
  );
};

export default Source;

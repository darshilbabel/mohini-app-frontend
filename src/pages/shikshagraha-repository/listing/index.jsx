import React, { useEffect, useRef, useState } from "react";
import Header from "./Header.jsx";
import Filters from "./Filters.jsx";
import BrowseResources from "./BrowseResources.jsx";
import Pagination from "./Pagination.jsx";
import Footer from "../common/Footer.jsx";
import MitraAiAssistantAside from "./MitraAiAssistantAside.jsx";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore.js";
import { GrResources } from "react-icons/gr";
import { X } from "lucide-react";

export default function RepositoryPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [isMitraPopupOpen, setIsMitraPopupOpen] = useState(false);
  const { loadingList, loadingDetail, loadingMaster } = useRepositoryStore();
  // Add filter and search logic if needed
  const isLoading = loadingList || loadingDetail || loadingMaster;

  const mediaList = useRepositoryStore((state) => state.mediaList);

  const mediaCount = useRepositoryStore((state) => state.mediaCount);
  const pagination = useRepositoryStore((state) => state.pagination);
  const setPagination = useRepositoryStore((state) => state.setPagination);
  const itemsPerPage = pagination.limit;
  const containerRef = useRef(null);



  //scrolling logic
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current?.scrollIntoView({ behavior: "smooth", y: -999 });
    }
  }, [mediaList]);

  return (
    <div className="bg-gray-50 relative listing-pages" ref={containerRef}>
      <div className="container max-w-[1500px] h-full mx-auto">
        <div className="min-h-screen  py-3 flex flex-col  align-items-center gap-4 ">
          <Header />
          <Filters />
          <main className=" w-full mx-auto">
            {!!mediaList?.length && (
              <BrowseResources
                resources={mediaList}
                viewMode={viewMode}
                setViewMode={setViewMode}
                sortBy={sortBy}
                setSortBy={setSortBy}
              />
            )}
         
           
            {!isLoading && !!!mediaList?.length && (
              <div className="w-full pt-10 mx-auto flex flex-col items-center justify-center">
                <div className="text-muted">
                  <GrResources size={100} />
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                  <h2 className="text-lg py-2">No resources found</h2>
                  <p className="text-sm text-muted text-center max-w-[400px]">
                    If you can't find the resources you were looking for, please
                    ensure that your filters are set correctly or try clearing
                    them. If the issue persists, please feel free to reach out
                    to our support team for assistance.
                  </p>
                </div>
              </div>
            )}
               
               <div className="w-full mt-6 mx-auto">
                <Pagination
                  resourcesPerPage={itemsPerPage}
                  totalResources={mediaCount}
                  selectedPage={Math.floor(pagination.offset / itemsPerPage)}
                  paginate={(page) => {
                    setPagination({
                      ...pagination,
                      offset: (itemsPerPage + (page - 1) * itemsPerPage) || 0,
                      limit: itemsPerPage,
                    });
                  }}
                />
              </div>
          </main>
        </div>
      </div>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-75 text-white h-screen">
          Please wait we are loading your data
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsMitraPopupOpen(!isMitraPopupOpen)}
        className="fixed lg:!hidden bottom-8 right-8 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-60"
        style={{ 
          backgroundColor: '#1E3360',
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#152847'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1E3360'}
        aria-label={isMitraPopupOpen ? "Close Mitra AI Assistant" : "Open Mitra AI Assistant"}
      >
        {isMitraPopupOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <svg width="26" height="31" viewBox="0 0 26 31" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <path d="M24.8925 2.35163C24.7028 2.03349 24.4479 1.78048 24.1949 1.52558C23.687 1.01769 23.0526 0.573037 22.2898 0.318136C21.7819 0.12837 21.2108 0 20.5745 0L5.14419 0.00372088C4.57304 0.00372088 4.00189 0.130229 3.42884 0.321857C2.7312 0.576739 2.0949 0.956252 1.52375 1.5293C1.26887 1.78419 1.01586 2.10045 0.826108 2.35535C0.318211 3.11815 6.10352e-05 4.07069 6.10352e-05 5.08649V16.4537C6.10352e-05 17.8509 0.571208 19.1216 1.4605 20.009C2.3498 20.8983 3.6205 21.4694 5.01578 21.4694H19.1773L25.5269 30.3605L25.5902 5.02324C25.7186 4.06698 25.4004 3.11443 24.8925 2.35163ZM20.5745 18.7997H5.14419C4.50979 18.7997 3.93674 18.5448 3.494 18.1021C3.04935 17.6574 2.79635 17.0863 2.79635 16.4519L2.79449 12.4501V6.03517H22.9246L22.9879 22.2284L20.5745 18.7997Z" fill="white"/>
            <path d="M15.6853 10.734L16.1299 6.92383L13.0174 9.14707L9.96998 6.92383L10.3514 10.734L6.85748 12.2577L10.3514 13.7814L9.96998 17.5916L13.0174 15.3069L16.1299 17.5916L15.6853 13.7814L19.1773 12.2577L15.6853 10.734Z" fill="white"/>
          </svg>
        )}
      </button>

      {/* Mitra AI Assistant Popup */}
      {isMitraPopupOpen && (
        <>

          {/* Popup Modal */}
          <div className="fixed bottom-24 right-8 w-[250px] max-w-[calc(100vw-4rem) z-50">
            <MitraAiAssistantAside />
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

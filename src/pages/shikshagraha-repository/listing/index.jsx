import React, { useEffect, useRef, useState } from "react";
import Header from "./Header.jsx";
import Filters from "./Filters.jsx";
import BrowseResources from "./BrowseResources.jsx";
import Pagination from "./Pagination.jsx";
import Footer from "../common/Footer.jsx";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore.js";
import { GrResources } from "react-icons/gr";

export default function RepositoryPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
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
    <div className="bg-gray-50 relative" ref={containerRef}>
      <div className="container max-w-[1690px] h-full">
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
      <Footer />
    </div>
  );
}

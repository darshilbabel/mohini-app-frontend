import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPaginate from "react-paginate";

function Pagination({ resourcesPerPage, totalResources, paginate }) {
  const pageCount = Math.ceil(totalResources / resourcesPerPage);

  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    paginate(selectedPage);
  };

  return (
    <div className="flex justify-center">
      <ReactPaginate
        previousLabel={
          <div className="flex flex-col items-center justify-center border p-1 rounded bg-white text-sm w-[54px] h-[54px] ">
            <ChevronLeft className="icon" />
          </div>
        }
        nextLabel={
          <div className="flex flex-col items-center justify-center border p-1 rounded bg-white text-sm w-[54px] h-[54px] ">
            <ChevronRight className="icon" />
          </div>
        }
        breakLabel={
          <div className="flex flex-col items-center justify-center border p-1 rounded bg-white text-sm w-[54px] h-[54px] ">
            <span className="text-xl">...</span>
          </div>
        }
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName="flex items-center gap-2"
        previousLinkClassName="text-zinc-500"
        nextLinkClassName="text-zinc-500"
        activeLinkClassName="w-[54px] h-[54px] bg-blue-700 text-white p-1 border-0 rounded bg-blue-600  flex items-center justify-center"
        activeClassName="w-[54px] h-[54px]  bg-blue-700 text-white p-1 border-0 rounded bg-blue-600  flex items-center justify-center"
        pageLinkClassName="w-[54px] h-[54px] flex items-center justify-center border rounded"
      />
    </div>
  );
}

export default Pagination;

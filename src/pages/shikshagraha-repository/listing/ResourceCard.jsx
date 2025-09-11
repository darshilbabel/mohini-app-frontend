import React from "react";
import { Heart, Star, Download } from "lucide-react";
import SmallLogo from "./SmallLogo";
import { useNavigate } from "react-router-dom";
import { GrDocument } from "react-icons/gr";
const MEDIA_FILE_TYPE = {
  PDF: "PDF",
  DOCX: "DOCX",
  XLSX: "XLSX",
};

export const getMeidaFileLabelColors = (label_value) => {
  switch (label_value) {
    case MEDIA_FILE_TYPE.PDF:
      return {
        color: "text-[#2563EB]",
        background: "bg-white",
      };
    case MEDIA_FILE_TYPE.DOCX:
      return {
        color: "text-[#DC2626]",
        background: "bg-white",
      };
    case MEDIA_FILE_TYPE.XLSX:
      return {
        color: "text-[#9333EA]",
        background: "bg-white",
      };

    default:
      return {
        color: "text-[#DB2777]",
        background: "bg-white",
      };
  }
};

export default function ResourceCard({ resource, index }) {
  const navigate = useNavigate();
  const { background, color } = getMeidaFileLabelColors(
    resource?.media_type_display
  );
  const card_background =
    [
      "bg-[#D52C1A] text-white",
      "bg-[#382280] text-white",
      "bg-[#B8062B] text-white",
      "bg-[#E68000] text-white",
      "bg-[#D40A6F] text-white",
      "bg-[#802C81] text-white",
      "bg-[#BAE6FD] text-black",
      "bg-[#9CA3AF] text-white",
    ][index % 8] || "bg-red-100";
  return (
    <div
      className="bg-white rounded-[20px] border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow
                 flex flex-col justify-between gap-2.5 min-w-[340px] w-full h-full box-border "
      role="button"
      onClick={() => navigate(`/shikshagraha-commons/${resource?.id}`)}
    >
      <div className="flex flex-col gap-3.5 p-3.5">
        {/* Image container */}
        <div className="relative flex flex-col gap-2.5 isolate w-full min-h-[180px] rounded-[10px]">
          <div
            className={card_background + " w-full h-full rounded-[10px]"}
            aria-label="Image placeholder"
          />
          {/* Suggestion Chip */}
          <div
            className={
              "absolute left-[10px] top-[10px]  rounded-[8px] py-1 px-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.3),0_1px_3px_1px_rgba(0,0,0,0.15)] flex justify-center items-center w-[47px] h-[22px] z-10 " +
              background +
              " " +
              color
            }
          >
            <span className=" font-manrope font-semibold text-[10px] leading-[14px] tracking-[0.1px] flex items-center justify-center">
              {resource?.media_type_display}
            </span>
          </div>
          {/* Like (Heart) button: FUTURE @TODO */}
          {/* <button
          className="absolute right-[9px] top-[10px] w-[30px] h-[30px] bg-gray-100 rounded-[17.6471px]
                     shadow-[0_0_100px_#CFD7DC] flex justify-center items-center z-20"
          aria-label="Like"
          type="button"
        >
          <Heart className="w-[21px] h-[21px]" />
        </button> */}
          {/* Title over image */}
          <h3
            className={
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-manrope font-bold text-[16px] leading-[22px] w-[300px] h-[22px] flex items-center justify-center z-30 text-center " +
              card_background
            }
          >
            {resource?.title}
          </h3>
        </div>
        {/* Details container */}
        <div className="flex flex-col gap-2 max-w-[320px] w-full">
          {/* Resource type row */}
          <div className="flex flex-row items-center gap-2.5 w-full h-[24px]">
            {/* Icon container */}
            <div
              className="relative flex items-center justify-center p-1 bg-blue-100 rounded-[6px] "
              aria-label="Resource Type Icon"
            >
              <div className=" text-blue-500 w-[24px] h-[24px] flex items-center justify-center">
                <GrDocument className="w-[20px] h-[20px]" />
              </div>
            </div>
            <span className="font-manrope font-semibold text-[14px] leading-[19px] text-gray-500">
              {resource?.document_type || "Not Available"}
            </span>
          </div>
          {/* Description */}
          <div
            className="flex flex-col justify-center gap-1.5 py-2 w-full overflow-hidden"
            aria-label="Resource description"
          >
            <h4 className="font-manrope font-bold text-[1rem] text-md leading-[22px] text-black">
              {resource?.title || "Not Available"}
            </h4>
            <p className="font-urbanist font-normal  leading-[20px] text-zinc-500 overflow-hidden line-clamp-2">
              {resource?.description || "Not Available"}
            </p>
          </div>
          {/* Tags row */}
          <div
            className="flex flex-row flex-wrap gap-2.5 w-full  overflow-hidden"
            aria-label="Resource tags"
          >
            {resource?.tag_names?.map((tag, i) => (
              <span
                key={i}
                className="bg-[#E5E7EB] rounded-full py-[2px] px-[10px] font-inter font-medium text-[12px] leading-[16px] text-[#374151]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="h-full flex justify-end items-start flex-col gap-2.5 p-3.5">
        {/* Rating and download count */}
        <div className="flex flex-row justify-between items-center w-full min-h-[36px]">
          {/* Rating */}
          {!!resource?.rating ? (
            <div className="flex flex-row justify-between items-center gap-2 w-[216px] min-h-[36px]">
              <div className="flex flex-row gap-2 w-[128px] text-xs items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-[1.25rem] h-[1.25rem] ${
                      i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs font-urbanist font-medium leading-[20px] text-zinc-500">
                <span>{resource?.rating}</span>
                <span>({resource?.reviews})</span>
              </div>
            </div>
          ) : (
            <div className="min-h-[36px]" />
          )}

          {/* Downloads */}
          {!!resource?.downloads ? (
            <div className="flex flex-row items-center justify-end gap-1 w-full min-w-[104px] h-[20px] relative">
              <Download className="w-[1.125rem] h-[1.125rem]" />
              <div className="flex flex-row gap-1">
                <span className="font-urbanist font-medium text-xs leading-[20px] text-zinc-500">
                  {resource?.downloads}
                </span>
                <span className="font-urbanist font-medium text-xs leading-[20px] text-zinc-500">
                  Downloads
                </span>
              </div>
            </div>
          ) : (
            <div className="min-h-[20px]" />
          )}
        </div>
        {/* Organization block */}
        {resource?.organization && (
          <div className="flex flex-row items-center gap-1.5 w-full h-[30.25px] max-w-[320px]">
            <SmallLogo />
            <div className="flex flex-col gap-0 w-[273.5px] h-[22px]">
              <span className="font-manrope font-medium text-[16px] leading-[22px] text-[#757575]">
                {resource?.organization}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

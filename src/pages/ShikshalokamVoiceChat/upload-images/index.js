import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { GoPlusCircle } from "react-icons/go";
import { handleFileUpload, partialUpdateMedia } from "../voice-chat";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UploadImages = ({ storyData, access_token, projectId, files, setFiles, setIsLoading }) => {
  const [fileErrorText, setFileErrorText] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fileSizeText = t('fileSizeText');

  return (
    <div className="mt-4">
      <div className="text-md font-bold text-black-500 mb-2">{t('uploadImagesStory')}</div>
      <div className="flex items-center gap-2 mb-4">
        <label className="cursor-pointer flex flex-col gap-2 text-purple-600 hover:text-purple-800">
          <span className="flex items-center">
            <span className="text-lg font-bold"><GoPlusCircle/></span>
            <span className="text-md font-bold pl-[2px]">{t('addImage')}</span>
          </span>
          {fileErrorText && <span className="text-red-500 block px-2">{fileErrorText}</span>}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              handleFileUpload(
                e, storyData, files, setFileErrorText, fileSizeText, access_token, setFiles, {}, projectId, setIsLoading, navigate
              );
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
        {files?.map((image, index) => (
          <div key={index} className="relative group bg-gray-200 rounded-lg overflow-hidden">
            <img src={image?.public_url} alt="Uploaded" className="w-full h-32 object-cover" />
            <button
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => partialUpdateMedia(image?.id, false, access_token, setIsLoading)}
            >
              <BiTrash className="text-white text-2xl" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadImages;

import React from "react";
import { DEFAULT_USER_IMAGE_URL } from "../../../../../constants/mitra.constants";

const UserImage = ({
  userDetail = {},
  defaultImageSrcUrl = DEFAULT_USER_IMAGE_URL,
  customClasses = {},
}) => {
  const {
    wrapperStyles = "",
    imageStyles = "",
    defaultImageStyles = "",
    userImageStyles = "",
  } = customClasses;

  const isUserImageAvailable = Boolean(userDetail?.image && userDetail.image !== "null");
  return (
    <div className={`div36 div37 text-2xl ${wrapperStyles}`}>
      {isUserImageAvailable ? (
        <img
          src={userDetail?.image}
          className={`user-image ${imageStyles} ${userImageStyles}`}
        />
      ) : (
        <img
          src={defaultImageSrcUrl}
          className={`user-image ${imageStyles} ${defaultImageStyles}`}
        />
      )}
    </div>
  );
};

export default UserImage;

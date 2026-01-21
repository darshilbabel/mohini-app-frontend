import React, { useMemo } from "react";
import Collapse from "../../../../../../components/Collapse/Collapse";

const Reasons = ({ reasonList = [], customClassNames = {} }) => {
  const hasReasons = useMemo(() => {
    const allEmptyReasons = reasonList.every(item => !item?.reason && !item?.content?.reason);
    return reasonList && reasonList.length > 0 && !allEmptyReasons;
  }, [reasonList]);

  if (!hasReasons) return null;

  return (
    <Collapse
      title="Reasons"
      defaultOpen={false}
      customClassNames={customClassNames}
    >
      <div className="bg-white">
        <div className="list-decimal list-inside space-y-2">
          {reasonList.map((item, index) => (
            (item?.reason || item?.content?.reason) && <p key={index} className="text-gray-700 text-sm">
              {index+1}. {item?.reason || item?.content?.reason}
            </p>
          ))}
        </div>
      </div>
    </Collapse>
  );
};

export default Reasons;


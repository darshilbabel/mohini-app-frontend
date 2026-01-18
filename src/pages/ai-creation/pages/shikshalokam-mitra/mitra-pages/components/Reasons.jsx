import React, { useMemo } from "react";
import Collapse from "../../../../../../components/Collapse/Collapse";

const Reasons = ({ reasonList = [], customClassNames = {} }) => {
  const hasReasons = useMemo(() => {
    return reasonList && reasonList.length > 0;
  }, [reasonList]);

  if (!hasReasons) return null;

  return (
    <Collapse
      title="Reasons"
      defaultOpen={false}
      customClassNames={customClassNames}
    >
      <div className="bg-white">
        <ol className="list-decimal list-inside space-y-2">
          {reasonList.map((item, index) => (
            <li key={index} className="text-gray-700 text-sm">
              {item?.reason || "No reason provided"}
            </li>
          ))}
        </ol>
      </div>
    </Collapse>
  );
};

export default Reasons;


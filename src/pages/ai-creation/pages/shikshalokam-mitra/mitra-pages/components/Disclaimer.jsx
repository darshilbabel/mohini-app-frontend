import React from 'react';

const Disclaimer = ({ text }) => {
  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
      <p className="text-sm text-blue-800 leading-relaxed">
        {text}
      </p>
    </div>
  );
};

export default Disclaimer;


import React, { useState } from "react";
import "./sliderStyle.css";

function Slider({
  min = 1,
  max = 6,
  onValueChange,
  value,
  setValue,
  isDisabled,
}) {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    setValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const getThumbPosition = () => {
    return `${((value - min + 0.35) / (max - min + 1.25)) * 100}%`;
  };

  const calculatePadding = () => {
    let leftPadding = 5;
    let rightPadding = 5;
    if (value == 1) {
      leftPadding = 11;
      rightPadding = 9;
    } else if (value == 2) {
      leftPadding = 10;
      rightPadding = 7;
    } else if (value == 3) {
      leftPadding = 10;
      rightPadding = 7;
    } else if (value == 4) {
      leftPadding = 7;
      rightPadding = 5;
    } else if (value == 5) {
      leftPadding = 7;
      rightPadding = 2;
    } else if (value == 6) {
      leftPadding = 5;
      rightPadding = 2;
    }
    return {
      paddingLeft: `${leftPadding}px`,
      paddingRight: `${rightPadding}px`,
    };
  };

  return (
    <div className="slider-container">
      <div className="slider-wrapper">
        <input
          type="range"
          className="slider bg-transparent"
          min={min}
          max={max}
          value={value}
          step={1}
          onChange={handleChange}
          disabled={isDisabled}
        />
        <div
          className="slider-thumb-text"
          style={{
            left: getThumbPosition(),
            ...calculatePadding(),
          }}
        >
          {value}
        </div>
      </div>
      <div className="slider-numbers">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
          <span
            key={num}
            className={`slider-number ${num === value ? "active" : ""} cursor-pointer`}
            style={{
              left: `${((num - min + 0.7) / (max - min + 1.5)) * 100}%`,
            }}
            onClick={() => {
              if (!isDisabled) {
                setValue(num);
                if (onValueChange) {
                  onValueChange(num);
                }
              }
            }}
          >
            {num}
          </span>
        ))}
      </div>
    </div>
  );
}

export default Slider;

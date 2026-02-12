import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Grid, List, ChevronDown, Check } from "lucide-react";
import ResourceCard from "./ResourceCard";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import MitraAiAssistantAside from "./MitraAiAssistantAside.jsx";
import { useTranslation } from "react-i18next";

// Custom hook for dropdown functionality
const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeDropdown]);

  return {
    isOpen,
    toggleDropdown,
    closeDropdown,
    dropdownRef,
  };
};

// Reusable Dropdown Component
const Dropdown = ({
  options,
  selectedValue,
  onSelect,
  renderButton,
  renderItem = DefaultDropdownItem,
  className = "",
  dropdownClassName = "",
  disabled = false,
  tooltipText = "",
}) => {
  const { isOpen, toggleDropdown, closeDropdown, dropdownRef } = useDropdown();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSelect = useCallback(
    (value) => {
      onSelect(value);
      closeDropdown();
    },
    [onSelect, closeDropdown]
  );

  const selectedOption = useMemo(
    () =>
      options.find((opt) => String(opt.value) === String(selectedValue)) ||
      options[0],
    [options, selectedValue]
  );

  const handleButtonClick = () => {
    if (!disabled) {
      toggleDropdown();
    }
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
      onMouseEnter={() => disabled && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div>
        <button
          type="button"
          className={`min-w-[120px] inline-flex items-center gap-1 text-sm focus:outline-none ${
            disabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-gray-700 hover:text-gray-900"
          }`}
          onClick={handleButtonClick}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
        >
          {renderButton(selectedOption, options)}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>
      {showTooltip && tooltipText && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
      {isOpen && !disabled && (
        <div
          className={`absolute right-0 z-10 mt-2 md:w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${dropdownClassName}`}
          role="listbox"
        >
          <div className="py-1">
            {options.map((option) => {
              if (!option || !option.value) return null;
              return (
                <div key={option.value} className="w-full">
                  {renderItem({
                    option,
                    isSelected: String(selectedValue) === String(option.value),
                    onSelect: () => handleSelect(option.value),
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Default dropdown item renderer
const DefaultDropdownItem = ({ option, isSelected, onSelect }) => {
  if (!option) return null;

  return (
    <button
      type="button"
      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between ${
        isSelected
          ? "bg-blue-50 text-blue-700"
          : "text-gray-700 hover:bg-gray-50"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      role="option"
      aria-selected={isSelected}
    >
      <span>{option?.label || "Unknown"}</span>
      {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
};

export default function BrowseResources({ resources, viewMode, setViewMode }) {
  const pagination = useRepositoryStore((state) => state.pagination);
  const setPagination = useRepositoryStore((state) => state.setPagination);
  const mediaCount = useRepositoryStore((state) => state.mediaCount);
  const sortBy = useRepositoryStore((state) => state.sortBy);
  const setSortBy = useRepositoryStore((state) => state.setSortBy);
  const searchInput = useRepositoryStore((state) => state.searchInput);
  const isSearchActive = searchInput && searchInput.trim().length > 0;

  const {t} = useTranslation();
  
  const sortOptions = [
    { value: "title", label: "Title (A-Z)" },
    { value: "-title", label: "Title (Z-A)" },
    { value: "created_at", label: "Date Added (Oldest First)" },
    { value: "-created_at", label: "Date Added (Newest First)" },
    { value: "updated_at", label: "Date Modified (Oldest First)" },
    { value: "-updated_at", label: "Date Modified (Newest First)" },
    // { value: "priority", label: "Priority (A-Z)" },
    // { value: "-priority", label: "Priority (Z-A)" },
    // { value: "media_type", label: "File Type (A-Z)" },
    // { value: "-media_type", label: "File Type (Z-A)" },
    // { value: "id", label: "ID (Smallest First)" },
    // { value: "-id", label: "ID (Largest First)" },
    // { value: "organization", label: "Organization (A-Z)" },
    // { value: "-organization", label: "Organization (Z-A)" },
  ];

  const perPageOptions = [
    { value: 12, label: "12" },
    { value: 24, label: "24" },
    { value: 36, label: "36" },
    { value: 48, label: "48" },
  ];

  const itemsPerPage = pagination.limit;
  const handleItemsPerPageChange = (value) => {
    setPagination({ limit: Number(value) });
  };
   
  // Removed unused variables
  return (
    <section className="px-1 md:px-4 pb-4 pt-1 max-w-[1670px]">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="w-full mb-3">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Browse Resources
          </h2>
          <p className="text-sm text-gray-600">
            Discover high quality resources for your project
          </p>
        </div>
        <div className="flex flex-col md:flex-row  items-center gap-6 w-full">

          <div className="flex items-center justify-between lg:justify-end w-full lg:gap-6">
          <div className="text-sm text-gray-600 font-bold">
            {mediaCount} results
          </div>

          <Dropdown
            options={sortOptions}
            selectedValue={sortBy}
            onSelect={(value) => {
              setSortBy(value);
            }}
            renderButton={(selected) => (
              <span>Sort by: {selected?.label || "Select"}</span>
            )}
            disabled={isSearchActive}
            tooltipText={`${t("sortDisabledTooltipText")}`}
          />
          </div>
       

          <div className="flex items-center justify-between flex-row-reverse lg:flex-row lg:justify-start lg:gap-6 w-full lg:w-auto">
          <div className="flex items-center gap-1 border border-gray-300 rounded">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Dropdown
            options={perPageOptions}
            selectedValue={itemsPerPage}
            onSelect={(value) => {
              handleItemsPerPageChange(Number(value));
            }}
            // className="ml-2"
            dropdownClassName="w-32"
            renderButton={(selected) => (
              <span>{selected?.value || 12} Per Page</span>
            )}
          />
          </div>
       
        </div>
      </div>
      <div className="flex gap-0 md:!gap-6 items-stretch ">
        <div
          className={`flex flex-col md:grid gap-6 w-full lg:!w-[calc(80%-1.5rem)]  ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 sm:grid-cols-1"
              : "grid-cols-1"
          }`}
        >
          {resources.map((resource, index) => (
            <React.Fragment key={`resource-${resource.id}-${index}`}>
              <ResourceCard
                key={resource.id}
                resource={resource}
                index={index}
              />
            </React.Fragment>
          ))}
        </div>
        <div className="hidden lg:block w-[20%] self-stretch bg-white p-4 rounded-xl">
          <MitraAiAssistantAside />
        </div>
      </div>
    </section>
  );
}

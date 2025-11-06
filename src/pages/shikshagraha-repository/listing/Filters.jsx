import React, { useEffect, useState } from "react";
import { Search, X, XIcon } from "lucide-react";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import Select, { components } from "react-select";
import { useDebounce } from "react-use";

export default function Filters() {
  const globalSearchValue = useRepositoryStore((state) => state.q);

  const filters = useRepositoryStore((state) => state.filters);
  // fetch master list
  const fetchMasterList = useRepositoryStore((state) => state.fetchMasterList);
  // get master list
  const dropdown_meta = useRepositoryStore((state) => state.masterList);

  const resetFilters = useRepositoryStore((state) => state.resetFilters);

  const setFilters = useRepositoryStore((state) => state.setFilters);
  const setGlobalSearch = useRepositoryStore((state) => state.setSearch);

  const [search, setSearch] = useState("");

  const [debouncedSearch] = useDebounce(
    () => {
      if (!!search && search?.length > 3) {
        setGlobalSearch(search);
      }
    },
    500,
    [search]
  );

  useEffect(() => {
    const searched_param = new URLSearchParams(window.location.search)?.get(
      "q"
    );
    if (searched_param) {
      setSearch(searched_param);
    } else {
      setGlobalSearch("");
    }
  }, []);

  const handleChange = (key, value) => {
    setFilters({ [key]: value }, true);
  };

  useEffect(() => {
    fetchMasterList();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) {
      params.set("q", search);
    }
    const searchParams = `?${params.toString()}`;
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${searchParams}`
    );
  }, [search]);

  const searchInput = (
    <div className="relative flex flex-row items-center w-full h-full">
      <div className="flex items-center justify-center absolute left-0 top-0 h-full pl-[12px] pointer-events-none">
        <Search className="w-4 h-4 text-gray-300" />
      </div>
      <input
        type="text"
        placeholder="Search by keyword"
        className="pl-[41px] pr-[17px] py-[12px] max-w-[331px] w-full h-[53px] bg-white border border-gray-300 rounded-[12px] text-[14px] leading-[19px] font-manrope text-gray-700 placeholder-[#9CA3AF] focus:outline-none"
        value={search}
        onChange={(e) => {
          e.preventDefault();
          setSearch(e.target.value);
          if (!e.target.value) {
            setGlobalSearch("");
          }
          console.log("debouce ready", debouncedSearch(e.target.value));
        }}
      />
      {(search?.length > 0 || globalSearchValue?.length > 0) && (
        <button
          onClick={() => {
            setSearch("");
            setGlobalSearch("");
          }}
          className="flex items-center justify-center absolute right-3 top-0 h-full pl-[12px]"
        >
          <XIcon className="w-4 h-4 text-red-500" />
        </button>
      )}
    </div>
  );

  return (
    <div className="md:sticky top-0 z-50 flex flex-row items-center p-3 bg-white max-w-[1670px]  w-full rounded-[1rem] shadow-[0_0_4px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-center p-0 gap-3 w-full md:w-[75%]">
        {!!dropdown_meta?.length
          ? dropdown_meta?.map(({ label, options, key }, index) => (
              <React.Fragment key={`label-${label}-${index}`}>
                <DropdownSelect
                  key={label}
                  label={label}
                  options={options}
                  selected={filters[key] || "Select a " + label}
                  onChange={(value) => handleChange(key, value)}
                />
              </React.Fragment>
            ))
          : null}
        {!!Object.keys(filters).some((key) => !!filters[key]?.length) && (
          <button
            className="p-2 rounded-[12px] flex items-center gap-2 text-red-600 bg-red-50"
            onClick={() => resetFilters()}
          >
            <X className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      <div className="flex justify-end ml-auto relative z-10 w-full md:w-[25%]">
        <div className="flex flex-col items-start max-w-[331px] w-full h-[53px]">
          {searchInput}
        </div>
      </div>
    </div>
  );
}

const CustomMultiValue = (props) => {
  const { index, getValue } = props;
  const maxToShow = 2;
  const selected = getValue();

  if (index < maxToShow) {
    return <components.MultiValue {...props} />;
  }

  if (index === maxToShow) {
    const remaining = selected.length - maxToShow;
    return (
      <div className="flex items-center px-2 text-sm text-gray-600">
        +{remaining} more
      </div>
    );
  }

  return null;
};


const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={props.isSelected}
          readOnly
          className="mr-2 accent-blue-500"
        />
        <label>{props.label}</label>
      </div>
    </components.Option>
  );
};

const MenuList = (props) => {
  const {
    options,
    value,
    onChange,
  } = props.selectProps;

  const allSelected = value?.length === options?.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      onChange([], { action: "deselect-all" });
    } else {
      onChange(options, { action: "select-all" });
    }
  };

  return (
    <components.MenuList {...props}>
      <div className="flex items-center px-3 py-2 border-b border-gray-200 bg-gray-50">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          className="mr-2 accent-blue-500"
        />
        <label className="font-medium text-gray-700 cursor-pointer select-none">
          {allSelected ? "Deselect All" : "Select All"}
        </label>
      </div>
      {props.children}
    </components.MenuList>
  );
};


const DropdownSelect = ({ label, options, selected, onChange }) => (
  <div className="relative mr-4 p-1">
    <Select
      options={options.map((x) => ({ value: x.value, label: x.display }))}
      value={selected}
      onChange={onChange}
      isMulti
      placeholder={label}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      components={{
        Option: CheckboxOption,
        MenuList: MenuList,
        MultiValue: CustomMultiValue,
      }}
      styles={{
        control: (base) => ({
          ...base,
          border: "none",
          background: "rgb(82 82 91 / 1%)",
          boxShadow: "none",
          minHeight: "40px",
          "&:hover": { border: "none" },
        }),
        placeholder: (base) => ({ ...base, color: "#49454F" }),
        valueContainer: (base) => ({
          ...base,
          display: "flex",
          flexWrap: "wrap",
          gap: "4px",
          alignItems: "center",
          padding: "2px 8px",
        }),
        multiValue: (base) => ({
          ...base,
          background: "white",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "black",
          fontSize: "13px",
          padding: "0 4px",
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      className="max-w-[200px] bg-gray-100 rounded-[12px] text-zinc-600 text-sm"
    />
  </div>
);

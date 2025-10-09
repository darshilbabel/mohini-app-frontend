import React, { useEffect, useState } from "react";
import { Search, X, XIcon } from "lucide-react";
import { useRepositoryStore } from "../repository-hooks/useRepositoryStore";
import Select from "react-select";
import { useDebounce } from "react-use";
import { useRef } from "react";

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
  const ref = useRef(null);

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

  console.log("ref", ref.current);
  return (
    <div className="md:sticky top-0 z-50 flex flex-row items-center p-3 bg-white max-w-[1670px]  w-full rounded-[1rem] shadow-[0_0_4px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-center p-0 gap-0 w-full">
        {!!dropdown_meta?.length
          ? dropdown_meta?.map(({ label, options, key }, index) => (
              <React.Fragment key={`label-${label}-${index}`}>
                <DropdownSelect
                  key={label}
                  label={label}
                  options={options}
                  selected={filters[key] || "Select a " + label}
                  onChange={(value) => handleChange(key, value)}
                  ref={ref}
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

      <div className="flex justify-end ml-auto relative z-10 w-full">
        <div className="flex flex-col items-start max-w-[331px] w-full h-[53px]">
          {searchInput}
        </div>
      </div>
    </div>
  );
}

const DropdownSelect = ({ label, options, selected, onChange, ref }) => (
  <div className={`relative  mr-4 p-1`}>
    <Select
      ref={ref}
      options={options.map((x) => ({ value: x.value, label: x.display }))}
      value={selected}
      onChange={onChange}
      isMulti
      placeholder={label}
      closeMenuOnSelect={false}
      styles={{
        control: (base) => ({
          ...base,
          border: "none",
          background: "rgb(82 82 91 / 1%)",

          boxShadow: "none",
          "&:hover": {
            border: "none",
            boxShadow: "none",
          },
          "&:focus": {
            border: "none",
            boxShadow: "none",
          },
        }),
        indicatorSeparator: (base) => ({
          color: "rgb(82 82 91 / 1%)",
        }),
        indicatorsContainer: (base) => ({}),
        placeholder: (base) => ({
          ...base,
          color: "#49454F",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "black",
          background: "white",
        }),
        multiValue: (base) => ({
          ...base,
          color: "black",
          background: "white",
        }),
      }}
      className="max-w-[200px] bg-gray-100 rounded-[12px] text-zinc-600 text-sm  border border-transparent focus:border-blue-500 focus:outline-none appearance-none"
    />
  </div>
);

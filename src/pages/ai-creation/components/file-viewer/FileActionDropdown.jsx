import { useState, useRef, useEffect } from "react";

function FileActionDropdown({ label, icon: Icon, options, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!options || options.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="h-[35px] flex items-center justify-center gap-[8px] rounded-md border border-[#572E91] px-3 bg-[#572E91] font-['Manrope'] font-medium text-sm leading-none text-white"
      >
        <Icon />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[140px] rounded-md border border-gray-200 bg-white shadow-lg z-10">
          {options.map((media) => {
            const ext =
              media.file_name?.split(".").pop()?.toUpperCase() || "FILE";

            return (
              <button
                key={media.url}
                onClick={() => {
                  onSelect(media);
                  setOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                {ext}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FileActionDropdown;

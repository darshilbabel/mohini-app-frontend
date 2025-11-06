import { useEffect, useState } from "react";

function useCustomMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      const isMatching = media.matches;
      
      setMatches(isMatching);

      const listener = () => setMatches(isMatching);
      media.addEventListener('change', listener);

      return () => media.removeEventListener('change', listener);
    }
  }, [query]);
  

  return matches;
}

export default useCustomMediaQuery;
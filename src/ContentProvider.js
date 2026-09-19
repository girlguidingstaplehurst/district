import { createContext, useContext, useEffect, useState } from "react";
import { getNavigation, getPage, getPageSlug } from "./content";

const ContentContext = createContext({ navigation: [], loading: true, error: null });

export function ContentProvider({ children, value }) {
  const [state, setState] = useState({ navigation: [], page: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    Promise.all([getNavigation(), getPage(getPageSlug(window.location.pathname))])
      .then(([navigation, page]) => active && setState({ navigation, page, loading: false, error: null }))
      .catch((error) => {
        console.error("Unable to load navigation", error);
        if (active) setState({ navigation: [], page: null, loading: false, error });
      });
    return () => { active = false; };
  }, []);

  return <ContentContext.Provider value={value || state}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}

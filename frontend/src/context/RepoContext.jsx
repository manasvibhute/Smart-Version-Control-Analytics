import { createContext, useContext, useState } from "react";

const RepoContext = createContext();

export const RepoProvider = ({ children }) => {
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoHealth, setRepoHealth] = useState(null); // default or placeholder

  return (
    <RepoContext.Provider value={{ selectedRepo, setSelectedRepo, repoHealth, setRepoHealth }}>
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => useContext(RepoContext);
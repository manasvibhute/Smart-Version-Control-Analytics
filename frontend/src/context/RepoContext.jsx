import { createContext, useContext, useState } from "react";

const RepoContext = createContext();

export const RepoProvider = ({ children }) => {
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoHealth, setRepoHealth] = useState(null);

  // 🟢 Reset everything related to repo when user logs out
  const clearRepo = () => {
    setSelectedRepo(null);
    setRepoHealth(null);
  };

  return (
    <RepoContext.Provider 
      value={{ 
        selectedRepo, 
        setSelectedRepo, 
        repoHealth, 
        setRepoHealth,
        clearRepo   // ⬅ added here
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => useContext(RepoContext);

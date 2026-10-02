import React, {createContext, useContext} from 'react';
import {GroupContextType} from '@/features/groups/context/groupContextTypes';
import {useGroupProviderValue} from '@/features/groups/context/useGroupProviderValue';

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: React.ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({children}) => {
  const contextValue = useGroupProviderValue();

  return <GroupContext.Provider value={contextValue}>{children}</GroupContext.Provider>;
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

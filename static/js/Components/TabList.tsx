import React from 'react';

type TabProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => {
  const activeClass = isActive ? 'bg-[#6c5dd3] text-white' : 'bg-white text-[#6c5dd3]';
  return (
    <span className={`py-2 px-4 min-w-max text-center cursor-pointer rounded-md ${activeClass}`} onClick={onClick}>
      {label}
    </span>
  );
};

type TabListProps = {
  tabs: {
    id: string;
    label: string;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

const TabList: React.FC<TabListProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-row justify-between bg-white items-center w-full text-lg font-bold p-4 rounded-xl shadow-xl">
      <div className="flex flex-row gap-1">
        {tabs.map(tab => (
          <Tab
            key={tab.id}
            label={tab.label}
            isActive={tab.id === activeTab}
            onClick={() => {
              onTabChange(tab.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TabList;

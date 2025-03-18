"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';

const XmlParserContext = createContext<{
  xmlString: string | null;
  setXmlString: React.Dispatch<React.SetStateAction<string | null>>;
  sample: string | null;
  setSample: React.Dispatch<React.SetStateAction<string | null>>;
}>({
  xmlString: null,
  setXmlString: () => {},
  sample: null,
  setSample: () => {}
});

export const useXmlParser = () => useContext(XmlParserContext);

interface XmlParserProviderProps {
    children: React.ReactNode;  // Explicitly define the type for children
}

export const XmlParserProvider: React.FC<XmlParserProviderProps> = ({ children }) => {
  const [xmlString, setXmlString] = useState<string | null>(null);
  const [sample, setSample] = useState<string | null>(null);

  const value = useMemo(() => ({ xmlString, setXmlString, sample, setSample}), [xmlString, sample]);

  return (
    <XmlParserContext.Provider value={value}>
      {children}
    </XmlParserContext.Provider>
  );
};

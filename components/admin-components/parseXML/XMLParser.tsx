'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import XmlProcessor from './XMLProcessor';
import Connector from '@/components/interface/connector/Connector';
import SelectConfigurator from './SelectConfigurator';
import GatherProductsInfo from './GatherProductsInfo';
import ProductPreview from "./ProductPreview"

export const stages = { 
    "xml": XmlProcessor, 
    "select-configurator": SelectConfigurator, 
    "configurator": Connector, 
    "preview-sample": ProductPreview,
    "get-data": GatherProductsInfo
} as const

export default function XMLParser() {
  const [currentStage, setCurrentStage] = useState<keyof typeof stages>('xml');
  const [xmlString, setXmlString] = useState<string | null>(null);

  useEffect(() => {
    const savedXmlString = localStorage.getItem('xmlString');
    if (savedXmlString) {
      setXmlString(JSON.parse(savedXmlString));
    }
  }, []);

  const handleRestart = () => {
    setCurrentStage('xml');
    setXmlString(null);
    localStorage.removeItem('xmlString');
  };

  const handleXmlStringUpdate = (newXmlString: string | null) => {
    setXmlString(newXmlString);
    localStorage.setItem('xmlString', JSON.stringify(newXmlString));
  };

  const CurrentStageComponent = stages[currentStage];
  return (
    <div className="pt-6">
      <div className="mb-6">
        <CurrentStageComponent setCurrentStage={setCurrentStage}/>
      </div>
      {/* <div className="flex justify-center space-x-4">
        <Button onClick={handleRestart} variant="outline">
          Restart Parsing
        </Button>
      </div> */}
    </div>
  );
}

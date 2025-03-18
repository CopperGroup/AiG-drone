'use client'

import { Button } from "../ui/button"
import { useState } from "react"





const FilterButton = (divRef:any) => {
  
  const [bodyOverflow, setBodyOverflow] = useState(false);
  const toggleOverflow = () =>{
    if (bodyOverflow) {
      document.body.style.overflow = 'auto';
      divRef.current.style.overflow = 'hidden';
      document.body.style.filter = 'brightness(0.5)';
    } else {
      document.body.style.overflow = 'hidden';
      document.body.style.filter = 'brightness(0)';
      divRef.current.style.overflow = 'auto';
    }
    setBodyOverflow(!bodyOverflow);
  };
  return (
    <div className="fixed left-0 top-36 z-[9999]">
      <Button onClick={toggleOverflow} className="rounded-none rounded-r md:hidden"><i className="fa fa-filter"></i></Button>
    </div>
  )
}

export default FilterButton
const Badge = (priceToShow:any) => {


 

  let discount = 0;

  if(priceToShow.price!=priceToShow.priceToShow){
    discount = 100 - (priceToShow.priceToShow/(priceToShow.price/100));
  }


  return (
    <>
      {discount!=0?<p className="text-white text-center text-[10.5px] font-semibold border border-sky-400 bg-sky-500/90 mt-1 py-1 px-2 rounded-3xl z-10 relative">-{Math.round(discount)+'%'}</p>:<div></div>}
    </>
  )
}

export default Badge 
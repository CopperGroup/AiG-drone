import React from 'react'
import Image from 'next/image'

type PropType = {
  selected: boolean
  index: number
  onClick: () => void
  images: any
}

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, index, onClick, images } = props

  return (
    <div
      className={'embla-thumbs__slide'.concat(
        selected ? ' embla-thumbs__slide--selected' : ''
      )}
    >
      <button
        onClick={onClick}
        type="button"
        className="embla-thumbs__slide__number border"
      >
        <Image src={images[index]} width={500} height={500} alt='k' className='w-auto h-auto rounded-md  border-gray-600'></Image>
      </button>
    </div>
  )
}

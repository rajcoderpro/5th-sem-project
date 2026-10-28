import React from 'react'

const CompletedTask = ({data}) => {
  return (
    <div className="tsk rounded px-4 py-3 h-[85%] w-65 shrink-0 bg-[#7d86ff] flex justify-between flex-col"> 
                <div>
                    <div className="top flex justify-between"> 
                        <button className="bg-[#3946ff] text-gray-100 text-semibold font-md px-5 py-1 mt-2 rounded-sm ">{data.category}</button>
                        <span className='text-sm mt-3 font-bold text-white'>{data.date}</span>
                    </div>
                    <h1 className='mt-4 font-bold text-xl text-[#4d13aa]'>{data.title}</h1> 
                </div>
                <p className='mb-10 text-white font-medium text-md '>{data.description}</p>
                <div className='flex mb-1 justify-between '>
                    <button className='text-[12px] px-2 py-1 font-semibold text-white cursor-pointer active:scale-95 rounded  bg-[#3946ff]'>Mark as completed</button>
                    <button className=' text-[12px] px-2 py-1 font-semibold text-white cursor-pointer active:scale-95  bg-[#3946ff]'>Mark as failed</button>
                </div>
            </div>
  )
}

export default CompletedTask
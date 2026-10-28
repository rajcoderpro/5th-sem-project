import React from 'react'

const NewTask = ({data}) => {
  return (
    <div className="tsk rounded px-4 py-3 h-[85%] w-65 shrink-0 bg-[#b17feb] flex justify-between flex-col"> 
                <div>
                    <div className="top flex justify-between"> 
                        <button className="bg-[#9443f1] text-gray-100 text-semibold font-md px-5 py-1 mt-2 rounded-sm ">{data.category}</button>
                        <span className='text-sm mt-3 font-bold text-white'>{data.date}</span>
                    </div>
                    <h1 className='mt-4 font-bold text-xl text-[#6802ac]'>{data.title}</h1> 
                </div>
                <p className='mb-10 text-white font-medium text-md '>{data.description}</p>
                <button className='text-sm  font-semibold text-white py-1 cursor-pointer active:scale-95 rounded  bg-[#9443f1]'>Accept task</button>
            </div>
  )
}

export default NewTask
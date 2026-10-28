 
const AcceptedTask = ({data , id ,taskIdx}) => {
  return (
    <div className="tsk rounded px-4 py-3 h-[85%] w-65 shrink-0 bg-[#f599d2] flex justify-between flex-col"> 
                <div>
                    <div className="top flex justify-between"> 
                        <button className="bg-[#f03784] text-gray-100 text-semibold font-md px-5 py-1 mt-2 rounded-sm ">{data.category}</button>
                        <span className='text-sm mt-3 font-bold text-white'>{data.date}</span>
                    </div>
                    <h1 className='mt-4 font-bold text-xl text-[#f30588]'>{data.title}</h1> 
                </div>
                <p className='mb-10 text-white font-medium text-md '>{data.description}</p>
                <button  className='text-sm text-white font-semibold mx-1 py-1.5 cursor-pointer active:scale-95 rounded  bg-[#f03784]'>Complete </button>
            </div>
  )
}

export default AcceptedTask
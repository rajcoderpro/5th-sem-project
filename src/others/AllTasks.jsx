import { useContext } from "react"
import { dataContext } from "../data/DataProvider"
import TaskLine from "./TaskLine"

const AllTasks = () => {
  const data = useContext(dataContext)

  return (
    <div className="flex gap-2 flex-col  ">
      <div className="flex justify-between gap-5 mx-5 bg-[#a97ab3] px-5  rounded-lg py-5">
        <div className = "text-white font-bold text-xl w-1/5  px-5 py-3  rounded-lg">Employee Name</div>
        <div className = 'text-white font-bold text-xl w-1/5  px-5 py-3  rounded-lg' >New Tasks</div>
        <div className = 'text-white font-bold text-xl w-1/5  px-5 py-3  rounded-lg'>Accepted Tasks</div>
        <div className = 'text-white font-bold text-xl w-1/5  px-5 py-3  rounded-lg'>Completed Tasks</div>
        <div className = 'text-white font-bold text-xl w-1/5  px-5 py-3  rounded-lg'>Failed Tasks</div>

      </div>
      {JSON.parse(data).map((elem , idx) =>{
        return <TaskLine key = {idx} data = {elem}/>
      })}
    </div>
  )
}

export default AllTasks
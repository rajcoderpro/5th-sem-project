
const TaskLine = ({data}) => {
  return (
    <div className="flex justify-between gap-5 mx-5 bg-[#C39F9B] px-5 rounded-lg py-3">
        <div className = " font-medium text-lg  text-[#000000] px-5 py-2 w-1/5  rounded-lg">{data.name}</div>
        <div className = ' font-medium text-xl  text-[#fff4f3] px-5 py-2 w-1/5  rounded-lg' >{data.taskNumbers[1].count}</div>
        <div className = ' font-medium text-xl  text-[#fff4f3] px-5 py-2 w-1/5  rounded-lg'>{data.taskNumbers[0].count}</div>
        <div className = ' font-medium text-xl  text-[#fff4f3] px-5 py-2  w-1/5 rounded-lg'>{data.taskNumbers[2].count}</div>
        <div className = ' font-medium text-xl  text-[#fff4f3] px-5 py-2 w-1/5  rounded-lg'>{data.taskNumbers[3].count}</div>

      </div>
  )
}

export default TaskLine
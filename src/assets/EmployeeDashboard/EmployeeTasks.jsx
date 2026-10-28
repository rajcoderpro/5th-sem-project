import AcceptedTask from './TaskCard/AcceptedTask.jsx'
import NewTask from './TaskCard/NewTask.jsx'
import FailedTask from './TaskCard/FailedTask.jsx'
import CompletedTask from './TaskCard/CompletedTask.jsx'
const EmployeeTasks = ({data}) => {
  return (
      <div className="mainTasks flex float-start gap-5 w-full h-[55%] px-5 py-3  overflow-x-auto ">
        
            {data.tasks.map((elem, idx) => {
                if(elem.failed){
                   return <FailedTask key = {idx} taskIdx = {idx} id = {data.id} data ={elem}/>
                }
                if(elem.completed){
                   return <CompletedTask key = {idx} taskIdx = {idx} id = {data.id} data ={elem}/>
                }
                if(elem.accepted){
                   return <AcceptedTask key = {idx} taskIdx = {idx} id = {data.id} data ={elem}/>
                }
                if(elem.newTask){
                   return <NewTask key = {idx} taskIdx = {idx} id = {data.id} data ={elem}/>
                }
            })}

        </div>
  )
}

export default EmployeeTasks
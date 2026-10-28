import EmployeeHeader from '../assets/EmployeeDashboard/EmployeeHeader'
import CreateTask from '../others/CreateTask'
import AllTasks from '../others/AllTasks'

const AdminPanel = ({loggedInUserData , set_user}) => {
  return (
    <div className='bg-[#E6CCBE] h-full w-full p-5'>
        <EmployeeHeader set_user = {set_user} loggedInUserData = {loggedInUserData} />
        <CreateTask />
        <AllTasks  />
    </div>
  )
}

export default AdminPanel
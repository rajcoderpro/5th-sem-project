import EmployeeHeader from "../assets/EmployeeDashboard/EmployeeHeader"
import EmpoyeeTaskBar from "../assets/EmployeeDashboard/EmpoyeeTaskBar"
import EmployeeTasks from "../assets/EmployeeDashboard/EmployeeTasks"

const EmployeeDashboard = ({loggedInUserData , set_user}) => {
return (
    <div className="employeeDashboard  w-full h-screen bg-[#000000]">
        <EmployeeHeader set_user = {set_user} loggedInUserData = {loggedInUserData} />

        <EmpoyeeTaskBar loggedInUserData = {loggedInUserData} />
        <EmployeeTasks data = {loggedInUserData} />
    </div>
)
}

export default EmployeeDashboard
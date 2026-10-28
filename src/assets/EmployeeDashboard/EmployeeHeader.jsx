import React, { useContext } from 'react'
import { dataContext } from '../../data/DataProvider'

const EmployeeHeader = ({loggedInUserData  , set_user }) => {
  const data = useContext(dataContext)
  const logOutButton = () => {
    localStorage.clear()
    set_user('') 
    localStorage.setItem('employees' , JSON.stringify(data))
    localStorage.setItem('admin' , JSON.stringify({
  'name':'Raj Poswal',
  'email': "admin@me.com",
  'password': "123",
  'id' : 1
}))

  }
  return (
   <div className="header flex justify-between px-5 py-3  ">
            <div className="Name">
                <h1 className="text-[#8d6b96] font-semibold text-2xl font-md mx-3" >Hello, <br /> <span className="text-4xl font-bold ">{loggedInUserData.name} </span></h1>
            </div>
            <button onClick = {logOutButton} className="bg-[#df8983] text-white text-md font-sm px-10 py-0 rounded-xl active:scale-95 ">Log Out</button>
        </div>
  )
}

export default EmployeeHeader
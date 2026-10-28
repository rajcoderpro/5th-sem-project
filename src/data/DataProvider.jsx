import  { createContext, useEffect, useState } from 'react'
import {setLocalStorage } from './Data'

export  const dataContext = createContext() 


const DataProvider = ({children}) => {
  setLocalStorage()
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const employees = localStorage.getItem('employees') 
    setUserData(employees)
    
  }, [])
  


  return (
    <div>
      <dataContext.Provider value= {userData}>  
        {children}
      </dataContext.Provider>
    </div>
  )
}

export default DataProvider

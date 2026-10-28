import React, { useContext, useState } from 'react'
import { dataContext } from '../data/DataProvider'

const CreateTask = () => {
    const userData = useContext(dataContext)
    const [title, settitle] = useState('')
    const [date, setdate] = useState('')
    const [asignto, setasignto] = useState('')
    const [category, setcategory] = useState('')
    const [description, setdescription] = useState('')
    const [task, settask] = useState({})
    const submitHandler = (e) => {
        e.preventDefault()
        settask({title, date, asignto, category, description, newTask: true, accepted: false, completed: false, failed: false})

        {userData.map((elem , idx) => {
            if(elem.name == asignto){
                userData[idx].tasks.push(task)
                userData[idx].taskNumbers[1].count = userData[idx].taskNumbers[1].count + 1 
                localStorage.setItem('employees' , JSON.stringify(userData))
            }
        })}


        settitle('')
        setdate('')
        setasignto('')
        setcategory('')
        setdescription('')


    }
  return (
    <div className='bg-[#E6CCBE] h-[50%] w-full p-5 flex flex-col gap-5'>
        <form  onSubmit={(e)=>{submitHandler(e)}} className='bg-[#C39F9B] px-5 py-3 flex justify-between gap-20 rounded-lg'>
            <div className="left  h-[80%] w-[40%] flex flex-col gap-5 p-2">
                <h2 className='font-semibold text-lg text-white'>Task Title</h2>
                <input value = {title} onChange = {(e) => {settitle(e.target.value)}} type="text" placeholder='Create a UI design' className=" placeholder:text-[#685465]  text-white rounded px-2 py-3 focus:outline-none border border-[#A07178]  " />
                <h2 className='font-bold text-xl text-white'>Date</h2>
                <input value = {date} onChange = {(e) => {setdate(e.target.value)}} type="date" placeholder='dd-mm-yyyy'   className="   rounded px-2 py-3 focus:outline-none border border-[#A07178]  " />
                <h2 className='font-bold text-xl text-white'>Asign to</h2>
                <input value = {asignto} onChange = {(e) => {setasignto(e.target.value)}} type="text" placeholder='Employee name'   className=" placeholder:text-[#685465] text-white  rounded px-2 py-3 focus:outline-none border border-[#A07178]  " />
                <h2 className='font-bold text-xl text-white'>Category</h2>
                <input value = {category} onChange = {(e) => {setcategory(e.target.value)}} type="text" placeholder='Design , dev etc...'   className=" placeholder:text-[#685465]  text-white  rounded px-2 py-3 focus:outline-none border border-[#A07178]  " />
            </div>
            <div className="right  h-[80%] w-[55%] flex flex-col gap-5">
                <h2 className='font-bold text-xl text-white'> Description</h2>
                <textarea value = {description} onChange = {(e) => {setdescription(e.target.value)}} placeholder='Enter Task Description (Max 500 words)' className=' placeholder:text-[#685465] text-white  rounded px-2 py-3 focus:outline-none border h-64 border-[#A07178]  ' /> 
                <button  className='bg-[#A07178] text-white py-2 px-4 rounded hover:bg-[#8A5F64] active:scale-95'>Create Task</button>
            </div>
        </form>
    </div>
  )
}

export default CreateTask
import React from 'react'

const EmpoyeeTaskBar = ({loggedInUserData}) => {
  return (
    <div className="tasksBar flex justify-between h-[25%] w-full px-5 py-3 ">
            <div className="box border border-gray-400  w-[20%] bg-[#b17feb] rounded-lg flex flex-col px-5 py-3 justify-center">
                <h2 className="text-white  text-3xl font-bold mb-3">{loggedInUserData.taskNumbers[1].count}</h2>
                
                <p className="text-white text-xl font-extrabold"> New Task</p>
            </div>
            <div className="box border border-gray-400 w-[20%] bg-[#7d86ff] rounded-lg flex flex-col px-5 py-3 justify-center">
                <h2 className="text-white text-3xl font-bold mb-3">{loggedInUserData.taskNumbers[2].count}</h2>
                
                <p className="text-white text-xl font-extrabold"> Completed</p>
            </div>
            <div className="box border border-gray-400 w-[20%] bg-[#f599d2] rounded-lg flex flex-col px-5 py-3 justify-center">
                <h2 className="text-white text-3xl font-bold mb-3">{loggedInUserData.taskNumbers[0].count} </h2>
                
                <p className="text-white text-xl font-extrabold"> Accepted</p>
            </div>
            <div className="box border border-gray-400 w-[20%] bg-[#fd8676] rounded-lg flex flex-col px-5 py-3 justify-center">
                <h2 className="text-white text-3xl font-bold mb-3">{loggedInUserData.taskNumbers[3].count}</h2>
                
                <p className="text-white text-xl font-extrabold"> Failed</p>
            </div>

        </div>
  )
}

export default EmpoyeeTaskBar
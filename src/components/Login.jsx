import { useRef, useState } from "react"
const Login = (props) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const onSubmitFunction =(e) => {
    e.preventDefault() ;
    props.handleLogin(email , password)
    setEmail("")
    setPassword("")
    
  }
  const formRef = useRef() 
  const emailRef = useRef() 
  const passwordRef = useRef() 
  const buttonRef = useRef() 
  // const tl = gsap.timeline() 
  // useGSAP
  return (
    <div 
    className=" bg-[url('../../src/Images/wolf.jpg')] bg-cover pl-12 flex justify-start items-center h-screen text-white">
        <form ref={formRef} onSubmit={  (e) => {onSubmitFunction(e)}} className="group box bg-transparent backdrop-blur-sm h-[65%] flex flex-col justify-between w-[30%] border rounded-2xl text-white p-5 transition-all duration-300 hover:border-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.75)]">
          <div className="inputs mt-10 flex flex-col gap-5 h-[50%] ">
            <input ref={emailRef} required value={email} onChange = {(e) => {setEmail(e.target.value)}} className="mx-3 rounded px-2 py-3 focus:outline-none border bg-transparent backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_14px_rgba(34,211,238,0.7)]" type="email" placeholder='Example@gmail.com' />
            <input ref={passwordRef} required value={password} onChange = {(e) => {setPassword(e.target.value)}} className="mx-3 focus:outline-none rounded px-2 py-3 border bg-transparent backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_14px_rgba(34,211,238,0.7)]" type="password" placeholder='Enter Password ' />
          </div>
            <button ref={buttonRef}  className='px-2 py-3 rounded-2xl border bg-transparent backdrop-blur-sm active:scale-95 cursor-pointer transition-all duration-300 group-hover:border-cyan-300 group-hover:shadow-[0_0_14px_rgba(34,211,238,0.7)]'>Log In</button> 
        </form>
    </div>
  )
}

export default Login
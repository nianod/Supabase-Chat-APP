import { useState, useEffect } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
import { supabase } from '../Integration/Authcontext'

const Filler = () => {
    const [newMessage, setNewMessage] = useState('')
    const [session, setSession] = useState(null)
    const [usersOnline, setUsersOnline] = useState('')
    const [messages, setNewMessages] = useState('') <div className="git commit -m ""></div>

    const send = (e) => {
        e.preventDefault()
    }
  
     useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
      return () => subscription.unsubscribe()
    }, [])    
    const signIn = async() => {
      await supabase.auth.signInWithOAuth({
        provider: 'google'
      })
    }

    const signOut = async () => {
      const { error } = await supabase.auth.signOut()
    }
    console.log(session)

    if(!session) {
      return (
        <div className='flex flex-col items-center justify-center mt-12'>
          <h2 className='text-white font-semibold'> Sign in with Google</h2>
          <button onClick={signIn} className='mt-2 bg-black text-white p-2 px-3  rounded h-full cursor-pointer'>Sign In</button>
        </div>
      )
    } else
  return (
    <div className='pb-20 p-10'>
      <h1 className='text-fuchsia-500 font-bold underline text-2xl text-center mt-5'>Connect with Your Loved ones</h1>
      <div className='border w-full h-screen min-h-[600px] border-white rounded mt-5'>
        <div className='flex justify-between border-b-1 border-gray-300 p-3'>
          <div className='text-gray-400'>
            <p>Signed in as: {session?.user?.email}</p>
            <span>2 users online</span>
          </div>
          <div>
            <button onClick={signOut} className='bg-black text-white p-2 px-3  rounded h-full cursor-pointer'>sign Out</button>
          </div>
        </div>
        <div className='overflow-y-auto min-h-[450px]'>

        </div>
        <div className='mt-3 p-3 border-t-[1.5px] border-gray-700'>
            <form className='gap-5 flex flex-col sm:flex-row'>
                <input type="text"
                   className='p-2 w-full bg-[#363535] rounded text-white'
                   placeholder='Type your message...'
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className='text-white flex gap-1 items-center bg-black p-2  rounded h-full cursor-pointer'
                  onClick={send}
                >
                   Send <FaPaperPlane />
                </button>
            </form>
        </div>
      </div>
    </div>
  )
}

export default Filler

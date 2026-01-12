import { useState, useEffect } from 'react'
import { FaPaperPlane } from 'react-icons/fa'
import { supabase } from '../Integration/Authcontext'

const Filler = () => {
    const [newMessage, setNewMessage] = useState('')
    const [session, setSession] = useState(null)
    const [usersOnline, setUsersOnline] = useState('')
    const [messages, setMessages] = useState([])


    const send = async (e) => {
        e.preventDefault()
        supabase.channel('person1').send({
          type: 'broadcast',
          event: 'message',
          payload: {
            message : newMessage,
            user_name: session?.user?.user_metadata?.full_name,
            avatar: session?.user?.user_metadata?.avatar_url,
            timestamp: new Date().toLocaleTimeString()
          }
        })
        setMessages((prevMessages) => [...prevMessages,
        {
          message: newMessage,
          user_name: session?.user?.user_metadata?.full_name,
          avatar: session?.user?.user_metadata?.avatar_url,
          timestamp: new Date().toLocaleTimeString()
        }
        ])
        setNewMessage('')
        
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


    //Sockets
    useEffect(() => {
      if(!session) {
        setUsersOnline([])
        return
      }

      const person1 = supabase.channel('person1', {
        config: {
          presence: {
            key: session?.user?.id
          }
        }
      })

      person1.on('broadcast', {event: 'message'}, (payload) => {
        setMessages((prevMessages) => [...prevMessages, payload.payload])
       // console.log(messages)
      })

      person1.subscribe(async (status) => {
        if(status === 'SUBSCRIBED') {
          await person1.track({
            id: session?.user?.id
          });
        };
      });

      person1.on('presence', {event: 'sync'}, () => {
        const state = person1.presenceState()
        setUsersOnline(Object.keys(state))
      })

      return () => {
        supabase.removeChannel(person1)
      }

    }, [session])


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
            <p className='text-green-500'>{usersOnline.length} users online <span className='text-[10px] text-green-500'>🟢</span></p>
          </div>
          <div>
            <button onClick={signOut} className='bg-black text-white p-2 px-3  rounded h-full cursor-pointer'>sign Out</button>
          </div>
        </div>
      <div className='p-3 h-[450px] flex flex-col overflow-y-auto '>
        {messages.map((msg, index) => {
          const isMyMessage = msg?.user_name === session?.user?.user_metadata?.full_name

          return (
            <div
              key={index}
              className={` w-full flex items-start ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
              {!isMyMessage && (
                <img className='rounded-full w-10 h-10 mr-2' src={msg.avatar} alt="avatar" />
              )}
              <div className={`flex flex-col max-w-xs ${isMyMessage ? 'items-end' : 'items-start'}`}>
                <p className={` text-white p-2 mt-2 rounded-lg ${isMyMessage ? "bg-blue-500" : "bg-gray-700"}`}>
                  {msg.message}
                </p>
                <span className='mt-1 text-gray-300'>{msg.timestamp}</span>
              </div>
            </div>
            
          ) 
          
        })}
      </div>

        <div className='mt-3 p-3 border-t-[1.5px] border-gray-700'>
            <form onSubmit={send} className='gap-5 flex flex-col sm:flex-row'>
                <input type="text"
                   className='p-2 w-full bg-[#363535] rounded text-white'
                   placeholder='Type your message...'
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className='text-white flex gap-1 items-center bg-black p-2  rounded h-full cursor-pointer'
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


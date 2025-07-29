import { useState } from 'react'
import { FaPaperPlane } from 'react-icons/fa'

const Filler = () => {
    const [message, setMessage] = useState('')

    const send = (e) => {
        e.preventDefault()
    }
  return (
    <div className='pb-20 p-10'>
      <h1 className='text-fuchsia-500 font-bold underline text-2xl text-center mt-5'>Connect with Your Loved ones</h1>
      <div className='border w-full h-screen min-h-[600px] border-white rounded mt-5'>
        <div className='flex justify-between border-b-1 border-gray-300 p-3'>
          <div className='text-gray-400'>
            <p>Signed in as:</p>
            <span>2 users online</span>
          </div>
          <div>
            <button className='bg-black text-white p-2 px-3  rounded h-full cursor-pointer'>sign Out</button>
          </div>
        </div>
        <div className='mt-3 p-3'>
            <form className='gap-5 flex flex-col sm:flex-row'>
                <input type="textarea"
                   className='p-2 w-full bg-[#363535] rounded text-white'
                   placeholder='Type your message...'
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
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

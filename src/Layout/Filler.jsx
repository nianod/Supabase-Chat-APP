import { useState, useEffect, useRef } from 'react'
import { FaSignOutAlt,FaGoogle, FaUsers, FaArrowRight, FaCog, FaSmile, FaPaperclip } from 'react-icons/fa'
import { FiSend } from 'react-icons/fi'
import { supabase } from '../Integration/Authcontext'

const ChatApp = () => {
    const [newMessage, setNewMessage] = useState('')
    const [session, setSession] = useState(null)
    const [usersOnline, setUsersOnline] = useState([])
    const [messages, setMessages] = useState([])
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const left = () => {
        alert('Clear all the messages?')
        window.location.reload()
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const send = async (e) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const messageData = {
            message: newMessage,
            user_name: session?.user?.user_metadata?.full_name,
            avatar: session?.user?.user_metadata?.avatar_url,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            user_id: session?.user?.id
        }

        supabase.channel('person1').send({
            type: 'broadcast',
            event: 'message',
            payload: messageData
        })
        
        setMessages((prevMessages) => [...prevMessages, messageData])
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

    const signIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google'
        })
    }

    // Sockets
    useEffect(() => {
        if (!session) {
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

        person1.on('broadcast', { event: 'message' }, (payload) => {
            setMessages((prevMessages) => [...prevMessages, payload.payload])
        })

        person1.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await person1.track({
                    id: session?.user?.id,
                    name: session?.user?.user_metadata?.full_name,
                    avatar: session?.user?.user_metadata?.avatar_url
                })
            }
        })

        person1.on('presence', { event: 'sync' }, () => {
            const state = person1.presenceState()
            const users = Object.values(state).map(user => user[0])
            setUsersOnline(users)
        })

        return () => {
            supabase.removeChannel(person1)
        }
    }, [session])

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 md:p-12 max-w-md w-full border border-gray-700 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiSend className="text-white text-3xl" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome to ChatConnect</h1>
                        <p className="text-gray-300">Connect with your loved ones instantly</p>
                    </div>
                    
                    <button 
                        onClick={signIn}
                        className="w-full cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 "
                    >
                        <FaGoogle className=" " />
                        <span>Continue with Google</span>
                        <FaArrowRight className="ml-auto" />
                    </button>
                    
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            By continuing, you agree to our Terms and Privacy Policy
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                 <div className="bg-gray-800/70 backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-6 border border-gray-700 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img 
                                    src={session?.user?.user_metadata?.avatar_url} 
                                    alt="Profile" 
                                    className="w-12 h-12 rounded-full border-2 border-blue-500"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {session?.user?.user_metadata?.full_name}
                                </h2>
                                <p className="text-gray-400 text-sm">{session?.user?.email}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-900/50 rounded-xl px-4 py-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <FaUsers className="text-green-400" />
                                    <span className="text-white font-semibold">{usersOnline.length}</span>
                                    <span className="text-gray-400">online</span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={signOut}
                                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-4 py-2 cursor-pointer rounded-xl transition-all duration-300"
                            >
                                <FaSignOutAlt />
                                <span className="hidden md:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                     <div className="bg-gray-900/80 p-4 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                                    Global Chat
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">Real-time messaging with everyone online</p>
                            </div>
                            <button 
                             onClick={left}
                             className="text-gray-400 cursor-pointer hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                                <FaCog className="text-xl" />
                            </button>
                        </div>
                    </div>

                     <div className="h-[500px] md:h-[550px] p-4 overflow-y-auto bg-gradient-to-b from-gray-900/30 to-gray-800/30">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <div className="w-24 h-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                                    <FiSend className="text-4xl text-gray-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                                <p className="text-center">Be the first to send a message!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg, index) => {
                                    const isMyMessage = msg?.user_id === session?.user?.id

                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-3 ${isMyMessage ? 'flex-row-reverse' : ''}`}
                                        >
                                            {!isMyMessage && (
                                                <img 
                                                    src={msg.avatar} 
                                                    alt="avatar" 
                                                    className="w-10 h-10 rounded-full border-2 border-blue-500 flex-shrink-0"
                                                />
                                            )}
                                            
                                            <div className={`max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                                {!isMyMessage && (
                                                    <p className="text-gray-300 text-sm mb-1 ml-1">{msg.user_name}</p>
                                                )}
                                                <div className={`rounded-2xl p-3 ${isMyMessage 
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-600 rounded-br-none' 
                                                    : 'bg-gray-700/80 rounded-bl-none'
                                                }`}>
                                                    <p className="text-white">{msg.message}</p>
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1 px-1">
                                                    {msg.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                     <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                        <form onSubmit={send} className="flex items-center gap-3">
                            <button 
                                type="button"
                                title="media"
                                className="text-gray-400 cursor-not-allowed hover:text-white p-3 rounded-xl hover:bg-gray-700/50 transition-colors"
                            >
                                <FaPaperclip className="text-xl" />
                            </button>
                            
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    className="w-full bg-gray-800/70 border border-gray-600 rounded-xl py-3 px-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    placeholder="Type your message here..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onFocus={() => setIsTyping(true)}
                                    onBlur={() => setIsTyping(false)}
                                />
                                <button 
                                    type="button"
                                    title='emoji'
                                    className="absolute cursor-not-allowed right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    <FaSmile className="text-xl" />
                                </button>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className={`p-3 rounded-xl flex items-center cursor-pointer justify-center transition-all duration-300 transform hover:scale-105 ${newMessage.trim() 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700' 
                                    : 'bg-gray-700 cursor-not-allowed'
                                }`}
                            >
                                <FiSend className="text-white text-xl" />
                            </button>
                        </form>
                        
                         {isTyping && (
                            <div className="mt-2 ml-2">
                                <span className="text-sm text-gray-400 flex items-center gap-1">
                                    <span className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                    </span>
                                    typing...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                 {usersOnline.length > 0 && (
                    <div className="hidden lg:block fixed right-8 top-1/2 transform -translate-y-1/2 w-64">
                        <div className="bg-gray-800/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-700 shadow-xl">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <FaUsers className="text-green-400" />
                                Online Users ({usersOnline.length})
                            </h3>
                            <div className="space-y-2">
                                {usersOnline.map((user, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                                        <div className="relative">
                                            <img 
                                                src={user.avatar} 
                                                alt={user.name} 
                                                className="w-8 h-8 rounded-full"
                                            />
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                                        </div>
                                        <span className="text-white text-sm truncate">{user.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatApp
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React from 'react'

const LoginForm = () => {
    return (
        <div className='p-6 bg-white rounded-lg shadow-md shadow-slate-300 max-w-xs w-full'>
            <form>
                <div>
                    <h2 className='font-bold text-black text-2xl mb-4'>Login</h2>
                </div>
                <div className='flex flex-col gap-7'>

                    <div className='flex gap-3 '>
                        <FontAwesomeIcon
                            icon={faUser}
                            width={10}
                            className='text-blue-600'
                        />
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder='Username'
                            className='outline-none border-b border-blue-600 text-sm p-1 placeholder:text-slate-300 font-normal flex grow'
                        />
                    </div>

                    <div className='flex gap-3 '>
                        <FontAwesomeIcon
                            icon={faLock}
                            width={10}
                            className='text-blue-600'
                        />
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder='Password'
                            className='outline-none border-b border-blue-600 text-sm p-1 placeholder:text-slate-300 font-normal flex grow'
                        />
                    </div>

                </div>
                <div>
                    <button className='px-10 py-2 text-center w-full mt-7 bg-blue-600 text-white rounded-md shadow-md shadow-blue-300'>Login</button>
                </div>
            </form>
            <p
            className='mt-3 text-sm text-center font-medium'
            >Don't have an Account? 
                <Link href="/register" className='text-blue-600'> Register</Link>
            </p>
        </div>
    )
}

export default LoginForm
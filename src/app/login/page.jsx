'use client';

import React, { useEffect } from 'react';
import LoginForm from "@/components/LoginForm/LoginForm";
import { useRouter } from 'next/navigation';

const Login = () => {

  const router = useRouter()

  useEffect(() => {
    const userExist = localStorage.getItem('user_id')
    if(userExist) router.push('/')
  }, [])

  return (
    <div className='w-full h-screen flex justify-center items-center bg-slate-200'>
      <LoginForm />
    </div>
  )
}

export default Login
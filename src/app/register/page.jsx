'use client';

import RegisterForm from '@/components/RegisterForm/RegisterForm'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const Register = () => {

  const router = useRouter()

  useEffect(() => {
    const userExist = localStorage.getItem('user_id')
    if(userExist) router.push('/')
  }, [])

  return (
    <div className='w-full h-screen flex justify-center items-center bg-slate-200'>
      <RegisterForm />
    </div>
  )
}

export default Register
'use client';

import { faBell } from '@fortawesome/free-regular-svg-icons'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import React, { useState } from 'react'

import style from './Header.module.css';

const Header = () => {

    const [userDropDown, setUserDropDown] = useState(false)
    const [notificationDropDown, setNotificationDropDown] = useState(false)

    return (
        <header className='px-8 py-4 shadow-md shadow-slate-200 bg-white w-full'>
            <div className='flex justify-between items-center gap-5'>
                <div className='min-w-24 md:w-36 '>
                    <img src="/logo.png" alt="Logo" width="100%" />
                </div>
                <div 
                className='flex gap-3 items-center'
                >
                    <div className='flex'>
                        <Link
                            href='/login'
                            className='py-1 px-5 bg-blue-600 rounded-md text-white shadow-sm shadow-blue-600'
                        >Login</Link>
                    </div>
                    <div className='flex justify-end items-center gap-1'>
                        <div 
                        className='md:relative'
                        >
                            <FontAwesomeIcon 
                            icon={faBell} 
                            width={15} 
                            className='cursor-pointer'
                            onClick={() => {
                                setNotificationDropDown(!notificationDropDown)
                            }}
                             />

                            {
                                notificationDropDown &&

                                <div className='absolute right-0 top-14 md:top-9 bg-white shadow-md w-72'>
                                    <h2
                                        className='py-2 px-5 font-bold'
                                    >What's New</h2>
                                    <div
                                        className={style.notificationFeed}
                                    >

                                        <div
                                            className='py-2 px-5 hover:bg-slate-100'
                                        >
                                            <h3
                                                className='font-semibold text-sm'
                                            >Notification Name</h3>
                                            <p
                                                className='font-light text-sm'
                                            >Detail description about the notification</p>
                                        </div>
                                        <div
                                            className='py-2 px-5 hover:bg-slate-100'
                                        >
                                            <h3
                                                className='font-semibold text-sm'
                                            >Notification Name</h3>
                                            <p
                                                className='font-light text-sm'
                                            >Detail description about the notification</p>
                                        </div>


                                    </div>
                                </div>
                            }
                        </div>
                        <div className='flex w-16 gap-2 cursor-pointer items-center justify-end'>
                            <FontAwesomeIcon icon={faAngleDown} width={10} />
                            <img
                                src="/user-avatar.png"
                                alt="User Avatar"
                                width='50%'
                                onClick={() => {
                                    setUserDropDown(!userDropDown);
                                }}
                            />

                            {
                                userDropDown &&

                                <div
                                    className='absolute right-3 top-16 bg-white p-5 shadow-md'
                                >
                                    <div>
                                        <p
                                            className='font-semibold text-base'
                                        >John David</p>
                                        <p
                                            className='font-normal text-xs'
                                        >johndavid123@gamail.com</p>
                                    </div>
                                    <div
                                        className='mt-4'
                                    >
                                        <Link
                                            href='/logout'
                                            className='bg-red-600 py-1 px-5 rounded-md text-white'
                                        >Logout</Link>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
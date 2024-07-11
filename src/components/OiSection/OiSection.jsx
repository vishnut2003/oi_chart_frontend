'use client';

import React, { useEffect, useState } from 'react';
import style from './OiSection.module.css';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import axios from 'axios';
import moment from 'moment'
import serverName from '@/serverName'

const OiSection = ({ oneScript, symbolSpecify }) => {

    const server = serverName()

    const [symbols, setSymbols] = useState(['Loading...'])
    const [expiry, setExpiry] = useState(['Loading...'])
    const [liveData, setLiveData] = useState(true)
    const [range, setRange] = useState(false)
    const [startRange, setStartRange] = useState(['Loading...'])
    const [endRange, setEndRange] = useState(['Loading...'])
    const [historical, setHistorical] = useState()

    const [fullStrikeRange, setFullStrikeRange] = useState([]);

    useEffect(() => {
        // Fetch symbols for filter
        axios.get(`${server}/fyers/nfo-symbols`)
            .then((response) => {
                setSymbols(response.data)

                // set nifty expiry in date
                axios.get(`${server}/fyers/expiry/${symbolSpecify}`)
                    .then((response) => {
                        setExpiry(response.data)

                        // Set Historical Date
                        let curr = new Date();
                        curr.setDate(curr.getDate() + 1);
                        let date = curr.toISOString().substring(0, 10);
                        setHistorical(date)

                        // set strike price
                        axios.get(`${server}/fyers/strike-price/${symbolSpecify}`)
                            .then((res) => {
                                if (res.data && res.data.length > 0) {
                                    setStartRange(res.data)
                                    setEndRange(res.data)
                                    setFullStrikeRange(res.data)
                                }
                            })
                    })
                    .catch((err) => {
                        console.log(err)
                    })

            })
            .catch((err) => {
                console.log(err);
            })

    }, [])

    const getOiData = async () => {

        let historicalDate;
        let strikeRange;

        // set live date or historic
        if (liveData) {
            let curr = new Date();
            curr.setDate(curr.getDate() + 1);
            historicalDate = curr.toISOString().substring(0, 10);
        } else {
            historicalDate = document.querySelector('#historical').value
        }

        // set strike range
        const rangeCheckbox = document.querySelector('#range-check-box').checked
        if (!rangeCheckbox) {
            strikeRange = fullStrikeRange
        } else if (rangeCheckbox) {
            const startStrike = document.querySelector('#start-range').value;
            const endStrike = document.querySelector('#end-range').value;

            let started = false;
            let ended = false
            strikeRange = []
            for (let i = 0; i < fullStrikeRange.length; i++) {
                if (fullStrikeRange[i].symbol == startStrike) {
                    started = true
                } else if (fullStrikeRange[i].symbol == endStrike) {
                    strikeRange.push(fullStrikeRange[i])
                    ended = true
                }

                if (started && !ended) {
                    strikeRange.push(fullStrikeRange[i])
                }
            }
        }

        const formData = {
            symbol: document.querySelector('#symbol').value,
            expiryDate: document.querySelector('#expiry').value,
            intervel: document.querySelector('#intervel').value,
            historical: historicalDate,
            strikeRange: strikeRange
        }
        
        axios.post(`${server}/breeze/oi-data`, formData)
            .then((res) => {
                console.log(res)
            })
    }

    const refreshExpiry = (e) => {
        const symbol = e.target.value
        axios.get(`${server}/fyers/expiry/${symbol}`)
            .then((response) => {
                const expiry = response.data ? response.data : []
                setExpiry(expiry)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const refreshStrikePrice = (e) => {
        const symbol = e.target.value;
        axios.get(`${server}/fyers/strike-price/${symbol}`)
            .then((res) => {
                if (res.data && res.data.length > 0) {
                    setStartRange(res.data)
                    setEndRange(res.data)
                    setFullStrikeRange(res.data)
                }
            })
    }

    const oiChangeData = [
        {
            CE: 1000,
            PE: 5000,
            Future: 1000,
            time: '10:10'
        },
        {
            CE: 3000,
            PE: 4000,
            Future: 1500,
            time: '10:20'
        },
        {
            CE: 2000,
            PE: 6000,
            Future: 2000,
            time: '10:30'
        },
        {
            CE: 6000,
            PE: 5000,
            Future: 1200,
            time: '10:40'
        },
        {
            CE: 6500,
            PE: 3000,
            Future: 2800,
            time: '10:40'
        },
        {
            CE: 5700,
            PE: 1000,
            Future: 2700,
            time: '10:40'
        },
        {
            CE: 2000,
            PE: 3200,
            Future: 3000,
            time: '10:40'
        },
        {
            CE: 1000,
            PE: 1500,
            Future: 3000,
            time: '10:40'
        },
    ]

    const forBarChart = [
        {
            name: 'CALL',
            oi: 555765

        },
        {
            name: 'PUT',
            oi: 458876
        }
    ]

    const barchartColor = {
        redGreen: ["#22B16C", "#EF2421"],
    };

    return (
        <div className={oneScript ? 'flex flex-col md:flex-row justify-center gap-4 items-start' : 'flex flex-col justify-center gap-4 items-start'}>
            <div className={oneScript ? 'flex flex-col gap-5 w-full md:w-3/4' : 'flex flex-col gap-5 w-full'}>

                {/* Filter Section */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Call Vs Put Open Interest</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        getOiData()
                    }}>
                        <div className='md:flex md:gap-5 mb-5'>
                            <div className='mb-3 md:mb-0'>
                                <p
                                    className='font-semibold text-base mb-1'
                                >Symbol</p>
                                <select
                                    onChange={(e) => {
                                        refreshStrikePrice(e)
                                        refreshExpiry(e)
                                    }}
                                    id='symbol'
                                    className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                >
                                    {
                                        symbols.map((symbol, index) => (
                                            <option
                                                key={index}
                                                selected={symbol == symbolSpecify ? true : false}
                                                value={symbol}
                                            >{symbol}</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className='mb-3 md:mb-0'>
                                <p
                                    className='font-semibold text-base mb-1'
                                >Expiry</p>
                                <select
                                    id='expiry'
                                    className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">

                                    {
                                        expiry.map((data, index) => (
                                            <option key={index} value={data.date}>{!data.date ? data : data.date}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div className='mb-3 md:mb-0'>
                                <p
                                    className='font-semibold text-base mb-1'
                                >Interval</p>
                                <select
                                    id='intervel'
                                    className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">

                                    <option value='1minute'>1 min</option>
                                    <option value='5minute'>5 min</option>
                                    <option value='30minute'>30 min</option>

                                </select>
                            </div>

                            <div className='flex justify-between items-start gap-5'>
                                <div className='mb-3 md:mb-0'>
                                    <p
                                        className='font-semibold text-base mb-1'
                                    >Live</p>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className={style.custom_checkbox_style}
                                        onChange={(e) => {
                                            setLiveData(!liveData)
                                        }}
                                    />
                                </div>
                                <div className='mb-3 md:mb-0'>
                                    <p
                                        className='font-semibold text-base mb-1'
                                    >Historical Date</p>
                                    <input
                                        type="date"
                                        disabled={liveData}
                                        defaultValue={historical}
                                        max={moment().format("YYYY-MM-DD")}
                                        id='historical'
                                        className='w-full border-0 px-2.5 py-2 text-sm bg-white shadow-md rounded-lg disabled:text-slate-400' />
                                </div>

                            </div>

                        </div>

                        <div className='md:flex md:gap-5'>

                            <div className='flex justify-between items-start gap-5'>
                                <div className='mb-3 md:mb-0'>
                                    <p
                                        className='font-semibold text-base mb-1'
                                    >Range</p>
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            setRange(!range)
                                        }}
                                        defaultChecked={range}
                                        id='range-check-box'
                                        className={style.custom_checkbox_style}
                                    />
                                </div>
                                <div className='mb-3 md:mb-0'>
                                    <p
                                        className='font-semibold text-base mb-1'
                                    >Range Start</p>
                                    <select
                                        disabled={!range}
                                        id='start-range'
                                        className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        {
                                            startRange.map((range, index) => (
                                                <option
                                                    key={index}
                                                    value={range.symbol}
                                                    selected={index == 0 ? true : false}
                                                >{range.strike_price ? range.strike_price : range}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <div className='mb-3 md:mb-0'>
                                    <p
                                        className='font-semibold text-base mb-1'
                                    >Range End</p>
                                    <select
                                        disabled={!range}
                                        id='end-range'
                                        className="bg-white shadow-md border-0 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                        {
                                            endRange.map((range, index, arr) => (
                                                <option
                                                    key={index}
                                                    value={range.symbol}
                                                    onChange={(e) => {
                                                        setEndStrike(e.target.value)
                                                        getOiData()
                                                    }}
                                                    selected={index + 1 == arr.length ? true : false}
                                                >{range.strike_price ? range.strike_price : range}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className='h-full flex flex-col items-start gap-2'>
                                <p>As of 15:30 Expiry 04-07-2024</p>
                            </div>

                        </div>
                        <button 
                                className='py-2 px-3 bg-blue-600 text-white rounded-md shadow-md shadow-blue-600 text-sm mt-3'
                                type='submit'>Get OI</button>
                    </form>
                </div>

                {/* Change in OI Chart */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Change in OI</h2>
                    <div className='flex flex-col'>
                        <div className='flex justify-between text-sm font-semibold mb-2'>
                            <p>OI</p>
                            <p>Future</p>
                        </div>
                        <ResponsiveContainer width={'100%'} aspect={4.0 / 1.5}>
                            <LineChart data={oiChangeData}>

                                <XAxis dataKey='time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <YAxis name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                <YAxis orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <Tooltip />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" dataKey="CE" stroke="#459962" yAxisId='left-axis' strokeWidth={'2px'} />
                                <Line type="monotone" dataKey="PE" stroke="#C13F3F" yAxisId='left-axis' strokeWidth={'2px'} />
                                <Line type="monotone" dataKey="Future" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'2px'} strokeDasharray={'4'} />
                            </LineChart>
                        </ResponsiveContainer>

                    </div>
                </div>

                {/* Total OI Chart */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Total OI</h2>
                    <div className='flex flex-col'>
                        <div className='flex justify-between text-sm font-semibold mb-2'>
                            <p>OI</p>
                            <p>Future</p>
                        </div>
                        <ResponsiveContainer width={'100%'} aspect={4.0 / 1.5}>
                            <LineChart data={oiChangeData}>

                                <XAxis dataKey='time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <YAxis name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                <YAxis orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <Tooltip />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" dataKey="CE" stroke="#459962" yAxisId='left-axis' strokeWidth={'2px'} />
                                <Line type="monotone" dataKey="PE" stroke="#C13F3F" yAxisId='left-axis' strokeWidth={'2px'} />
                                <Line type="monotone" dataKey="Future" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'2px'} strokeDasharray={'4'} />
                            </LineChart>
                        </ResponsiveContainer>

                    </div>
                </div>

                {/* Difference of Put Call OI Change Chart */}
                <div className='bg-white p-5 rounded-md'>
                    <h2
                        className='text-xl font-bold mb-6'
                    >Difference of Put Call OI Change</h2>
                    <div className='flex flex-col'>
                        <div className='flex justify-between text-sm font-semibold mb-2'>
                            <p>OI</p>
                            <p>Future</p>
                        </div>
                        <ResponsiveContainer width={'100%'} aspect={4.0 / 1.5}>
                            <LineChart data={oiChangeData}>

                                <XAxis dataKey='time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <YAxis name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                <YAxis orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <Tooltip />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" dataKey="CE" stroke="#2977DB" yAxisId='left-axis' strokeWidth={'2px'} />
                                <Line type="monotone" dataKey="Future" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'2px'} strokeDasharray={'4'} />
                            </LineChart>
                        </ResponsiveContainer>

                    </div>
                </div>
            </div>
            <div className={oneScript ? 'w-full md:w-1/4 sticky top-5 flex flex-col gap-5' : 'w-full flex flex-row gap-5'}>
                {/* Change in OI Bar Chart */}
                <div className='bg-white p-5 rounded-md w-full'>
                    <h2 className='font-bold text-sm'>Change in OI</h2>
                    <div className='w-full h-56'>
                        <ResponsiveContainer>
                            <BarChart data={forBarChart} width='100' height='100%'>
                                <Bar dataKey='oi' fill='green' barSize={60}>
                                    <LabelList
                                        dataKey="oi"
                                        position="center"
                                        fill='white'
                                        fontSize={'13px'}
                                        angle={270}
                                        offset={25}
                                    />

                                    {
                                        barchartColor.redGreen.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry} />
                                        ))
                                    }


                                </Bar>
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <XAxis dataKey='name' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Total OI */}
                <div className='bg-white p-5 rounded-md w-full'>
                    <h2 className='font-bold text-sm'>Total OI</h2>
                    <div className='w-full h-56'>
                        <ResponsiveContainer>
                            <BarChart data={forBarChart} width='100' height='100%'>
                                <Bar dataKey='oi' fill='green' barSize={60}>
                                    <LabelList
                                        dataKey="oi"
                                        position="center"
                                        fill='white'
                                        fontSize={'13px'}
                                        angle={270}
                                        offset={25}
                                    />

                                    {
                                        barchartColor.redGreen.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry} />
                                        ))
                                    }


                                </Bar>
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <XAxis dataKey='name' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OiSection
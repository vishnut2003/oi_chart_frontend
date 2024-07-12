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

    const [oiChartData, setOiChartData] = useState([])
    const [oiChartErr, setOiChartErr] = useState('')
    const [oiChartLoading, setOiChartLoading] = useState(false)

    const DataFormater = (number) => {
        if (number > 1000000000 || number < - 1000000000) {
            return (number / 1000000000).toString() + 'B';
        } else if (number > 1000000 || number < - 1000000) {
            return (number / 1000000).toString() + 'M';
        } else if (number > 1000 || number < - 1000) {
            return (number / 1000).toString() + 'K';
        } else {
            return number.toString();
        }
    }
    let xAxisDataPoints = 6;
    let xAxisInterval = Math.round(oiChartData.length / xAxisDataPoints);

    const getOiData = async () => {

        let historicalDate;
        let strikeRange;

        // set live date or historic
        if (liveData) {
            let curr = new Date();
            curr.setDate(curr.getDate());
            historicalDate = curr.toISOString().substring(0, 10);
        } else {
            historicalDate = document.querySelector('#historical').value
        }

        // set strike range
        const rangeCheckbox = document.querySelector('#range-check-box').checked
        if (!rangeCheckbox) {
            strikeRange = startRange
            console.log(strikeRange)
        } else if (rangeCheckbox) {
            const startStrike = await document.querySelector('#start-range').value;
            const endStrike = await document.querySelector('#end-range').value;

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

        setOiChartLoading(true)
        console.log(formData)

        await axios.post(`${server}/breeze/oi-data`, formData)
            .then((res) => {
                setOiChartData(res.data)
                setOiChartLoading(false)
                console.log(res)
                if (res.data.length == 0) {
                    setOiChartErr('No Data Available')
                } else {
                    setOiChartErr('')
                }
            })
            .catch((err) => {
                console.log(err)
                setOiChartLoading(false)
            })
    }

    // UseEffect
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
                        curr.setDate(curr.getDate());
                        let date = curr.toISOString().substring(0, 10);
                        setHistorical(date)

                        // set strike price
                        axios.get(`${server}/fyers/strike-price/${symbolSpecify}`)
                            .then(async (res) => {
                                if (res.data && res.data.length > 0) {
                                    setStartRange(res.data)
                                    setEndRange(res.data)
                                    setFullStrikeRange(res.data)
                                }
                                setStrikeRangeForFirst(res.data)
                                    .then((strikes) => {
                                        getOiData(strikes)
                                    })
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

    const setStrikeRangeForFirst = async (data) => {
        return new Promise((resolve, reject) => {
            let strikes = []
            for (let i = 0; i < data.length; i++) {
                strikes.push(data[i])
            }
            if (strikes.length > 0) {
                resolve(strikes)
            }
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
                            className='py-2 px-3 bg-blue-600 text-white rounded-md shadow-md shadow-blue-600 text-sm mt-3 flex justify-center items-center gap-2'
                            type='submit'>
                            {
                                oiChartLoading &&
                                <div
                                    className='w-2.5 h-2.5 rounded-full border border-r-0 border-b-0 animate-spin border-white'
                                ></div>
                            }
                            Get OI</button>
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
                        {
                            oiChartErr &&
                            <div>
                                <p className='py-2 px-3 bg-red-100 text-red-500 rounded-md'>No Data Found!</p>
                            </div>
                        }
                        <ResponsiveContainer width={'100%'} aspect={6.0 / 2.0}>
                            <LineChart data={oiChartData}>

                                <XAxis dataKey='call_date_time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' interval={xAxisInterval} />

                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <Tooltip formatter={DataFormater} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" dot={false} dataKey="call_oi_change" stroke="#459962" yAxisId='left-axis' strokeWidth={'1px'} />
                                <Line type="monotone" dot={false} dataKey="put_oi_change" stroke="#C13F3F" yAxisId='left-axis' strokeWidth={'1px'} />
                                <Line type="monotone" dot={false} dataKey="future_oi" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'1px'} strokeDasharray={'4'} />
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
                        {
                            oiChartErr &&
                            <div>
                                <p className='py-2 px-3 bg-red-100 text-red-500 rounded-md'>No Data Found!</p>
                            </div>
                        }
                        <ResponsiveContainer width={'100%'} aspect={6.0 / 2.0}>
                            <LineChart data={oiChartData}>

                                <XAxis dataKey='call_date_time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' interval={xAxisInterval} />

                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <Tooltip formatter={DataFormater} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" dot={false} dataKey="call_Oi" stroke="#459962" yAxisId='left-axis' strokeWidth={'1px'} />
                                <Line type="monotone" dot={false} dataKey="put_Oi" stroke="#C13F3F" yAxisId='left-axis' strokeWidth={'1px'} />
                                <Line type="monotone" dot={false} dataKey="future_oi" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'1px'} strokeDasharray={'4'} />
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
                        {
                            oiChartErr &&
                            <div>
                                <p className='py-2 px-3 bg-red-100 text-red-500 rounded-md'>No Data Found!</p>
                            </div>
                        }
                        <ResponsiveContainer width={'100%'} aspect={6.0 / 2.0}>
                            <LineChart data={oiChartData}>

                                <XAxis dataKey='call_date_time' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' interval={xAxisInterval} />

                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} name='OI' fill='black' orientation='left' yAxisId='left-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />
                                <YAxis domain={['auto', 'auto']} tickFormatter={DataFormater} orientation='right' yAxisId='right-axis' stroke='#A7A7A7' strokeWidth={'0.5px'} className='text-xs' />

                                <Tooltip formatter={DataFormater} />
                                <CartesianGrid stroke="#cecece" strokeDasharray="3 3" strokeWidth={'0.5px'} />
                                <Line type="monotone" dot={false} dataKey="ce_pe_diff" stroke="#2977DB" yAxisId='left-axis' strokeWidth={'1px'} />
                                <Line type="monotone" dot={false} dataKey="future_oi" stroke="#6A6A6A" yAxisId='right-axis' strokeWidth={'1px'} />
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
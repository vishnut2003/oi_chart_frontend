'use client';

import Header from "@/components/Header/Header";
import OiSection from "@/components/OiSection/OiSection";
import { useState } from "react";

export default function Home() {

  const [twoScript, setTwoScript] = useState(false)

  return (
    <div className="flex flex-col w-full">
      <Header />
      <div className="p-5">
        <div className="md:flex gap-4 p-3 justify-center hidden">
          <button
            className={twoScript ? "py-2 px-4 bg-blue-100 text-blue-600 text-sm font-semibold rounded-md" : 'py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md'}
            onClick={() => {
              setTwoScript(false)
            }}
          >1 Panel</button>
          <button
            className={twoScript ? 'py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-md' : "py-2 px-4 bg-blue-100 text-blue-600 text-sm font-semibold rounded-md"}
            onClick={() => {
              setTwoScript(true)
            }}
          >2 Panel</button>
        </div>
        {
          twoScript ?
            <div className="flex gap-3 flex-col md:flex-row">
              <div className="w-full">
                <OiSection symbolSpecify={'NIFTY'} />
              </div>
              <div className="w-full">
                <OiSection symbolSpecify={'BANKNIFTY'} />
              </div>
            </div>
            :
            <div className="flex gap-3 flex-col md:flex-row">
              <div className="w-full">
                <OiSection oneScript={true} symbolSpecify={'NIFTY'} />
              </div>
            </div>
        }
      </div>
    </div>
  );
}

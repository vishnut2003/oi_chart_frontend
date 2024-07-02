import Header from "@/components/Header/Header";
import OiSection from "@/components/OiSection/OiSection";

export default function Home() {

  return (
    <div className="flex flex-col w-full">
      <Header />
      <div className="p-5">
        <OiSection />
      </div>
    </div>
  );
}

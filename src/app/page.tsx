import { FetchData } from "@/components/FetchData";
import { AccountSet } from "@/components/AccountSet";
import { SetRegularKey } from "@/components/SetRegularKey";
import { Payload } from "@/components/Payload";
import { GetName } from "@/components/GetName";
import { Domain } from "@/components/Domain";
import { Vanity } from "@/components/Vanity";
import { Post } from "@/components/Post";

export default function App() {
  return (
    <>
      <FetchData />
      <div className="stats stats-vertical sm:stats-horizontal w-full">
        <AccountSet />
        <SetRegularKey/>
      </div>
      <div className="stats stats-vertical sm:stats-horizontal w-full">
        <Payload />
        <GetName />
      </div>
      <div className="stats stats-vertical sm:stats-horizontal w-full">
        <Domain />
        <Vanity />
      </div>
    </>
  )
}

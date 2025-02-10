import { FetchData } from "@/components/FetchData";
import { AccountSet } from "@/components/AccountSet";
import { SetRegularKey } from "@/components/SetRegularKey";
import { Payload } from "@/components/Payload";
import { GetName } from "@/components/GetName";
import { Domain } from "@/components/Domain";
import { Vanity } from "@/components/Vanity";

export default function App() {
  return (
    <>
      <FetchData />

      <div className="responsive">
        <AccountSet />
        <SetRegularKey/>
      </div>

      <div className="responsive">
        <Payload />
        <GetName />
      </div>

      <div className="responsive">
        <Domain />
        <Vanity />
      </div>
    </>
  )
}

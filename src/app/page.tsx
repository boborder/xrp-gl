import { FetchData } from "@/components/FetchData";
import { AccountSet } from "@/components/AccountSet";
import { DID } from "@/components/DID";
import { Multisign } from "@/components/Multisign";
import { Payload } from "@/components/Payload";
import { NFT } from "@/components/NFT";
import { AddressCheck } from "@/components/AddressCheck";
import { Domain } from "@/components/Domain";
import { Vanity } from "@/components/Vanity";

export default function App() {
  return (
    <>
      <FetchData />
      <div className="stats stats-vertical sm:stats-horizontal w-full">
        <AccountSet />
        <DID />
        {/* <Multisign /> */}
      </div>
      {/* <div className="stats stats-vertical sm:stats-horizontal"> */}
        <Payload />
        {/* <NFT /> */}
      {/* </div> */}
      <div className="stats stats-vertical sm:stats-horizontal w-full">
        <AddressCheck />
        <Domain />
        {/* <Vanity /> */}
      </div>
    </>
  )
}

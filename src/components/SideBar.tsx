import Link from "next/link";
import { Imag } from "./Imag";
import { Search } from "./Search";

export const SideBar = () => {
    return (
        <>
        {/* <div className="drawer xl:drawer-open"> */}
            <input id="side-drawer" type="checkbox" className="drawer-toggle" />
            <label htmlFor="side-drawer" className="drawer-button btn btn-square btn-ghost w-11 hidden sm:inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-11 h-11 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>

            <nav className="drawer-side">
                <label htmlFor="side-drawer" aria-label="close sidebar" className="drawer-overlay"></label>

                <ul className="menu p-2 w-56 h-full text-center text-lg bg-base-100">
                    <li><Search/></li>
                    <li><Link href="/" className="[transition:0.3s] text-lg hover:text-primary">
                        Home
                    </Link></li>
                    <li><Link href="/" className="[transition:0.3s] text-lg hover:text-primary" target="_blank" rel="noopener noreferrer">
                        About
                    </Link></li>
                    <li><Link href="/" className="[transition:0.3s] text-lg hover:text-primary" target="_blank" rel="noopener noreferrer">
                        Docs
                    </Link></li>
                    <li><Link href="/" className="[transition:0.3s] text-lg hover:text-primary">
                        Contact
                    </Link></li>
                    <li><Link href="https://youtube.com/dayjobdoor" target="_blank" rel="noopener noreferrer">
                        <Imag src={"/ipfs/youtube.png"} priority width={40} height={40} alt="youtube" />
                    </Link></li>
                    <li><Link href="https://x.com/dayjobdoor" target="_blank" rel="noopener noreferrer">
                        <Imag src={"/ipfs/twitter.png"} priority width={40} height={40} alt="twitter" />
                    </Link></li>
                    <li><Link href="https://github.com/boborder/xrp-gl" target="_blank" rel="noopener noreferrer">
                        <Imag src={"/ipfs/github.png"} priority width={40} height={40} alt="github" />
                    </Link></li>
                </ul>

            </nav>
        {/* </div> */}
        </>
    )
}

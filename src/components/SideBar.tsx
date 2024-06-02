import Link from "next/link";
import { Imag } from "./Imag";

export const SideBar = () => {
    return (
        <>
            <input id="side-drawer" type="checkbox" className="drawer-toggle" />
            <label htmlFor="side-drawer" className="btn btn-square btn-ghost drawer-button w-10">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-10 h-10 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
            <nav className="drawer-side">
                <label htmlFor="side-drawer" className="drawer-overlay"></label>
                <ul className="menu p-2 w-auto max-w-xs text-center text-lg h-full bg-base-100">
                    <li><form className="form-control">
                        <div className="join">
                            <input className="input input-bordered join-item w-24" placeholder="Search" />
                            <button className="btn join-item btn-neutral">🔍</button>
                        </div>
                    </form></li>
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
                    <li><Link href="https://youtube.com/" target="_blank" rel="noopener noreferrer">
                        <Imag src={"/ipfs/youtube.png"} priority width={40} height={40} alt="youtube" />
                    </Link></li>
                    <li><Link href="https://x.com/" target="_blank" rel="noopener noreferrer">
                        <Imag src={"/ipfs/twitter.png"} priority width={40} height={40} alt="twitter" />
                    </Link></li>
                    <li><Link href="https://github.com/xrpshhh/demo" target="_blank" rel="noopener noreferrer">
                        <Imag src={"/ipfs/github.png"} priority width={40} height={40} alt="github" />
                    </Link></li>
                </ul>
            </nav>
        </>
    )
}

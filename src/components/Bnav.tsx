"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { Imag } from './Imag';

export const Bnav = () => {
    const pathname = usePathname();

    return (
        <>
            <nav className="btm-nav bg-opacity-80 text accent">
                <Link className={`${pathname === "/" ? "active" : ""}`} href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </Link>
                <Link className={`${pathname === '/test' || pathname === '/' ? "" : "active"}`} href="/profile/user">
                    <Imag src={"/ipfs/logo.png"} width={32} height={32} alt="logo" />
                </Link>
                {/* <Link className={`${pathname === "/test" ? "active" : ""}`} href="/test">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </Link> */}
            </nav>
        </>
    )
}

"use client"
import { useRouter } from 'next/navigation';
import { SideBar } from "./SideBar";
import { Imag } from "./Imag"
import { Search } from "./Search";
import { Theme } from './Theme'
import { Auth } from "./Auth"

export const Nav = () => {
    const router = useRouter();
    return (
        <nav className="navbar h-16 z-10 text-accent bg-opacity-80 absolute shadow">

            <div className="navbar-start">
                <SideBar />
                <button onMouseDown={() => router.replace("/")} className="btn btn-ghost pl-0 pr-1 flex justify-start items-center">
                    <Imag src={"/ipfs/logo.png"} width={44} height={44} alt="logo" />
                    <h1 className="font-bold text-4xl">
                        XRPGL
                    </h1>
                </button>
            </div>
            <div className="navbar-center hidden md:inline-block">
                <Search />
            </div>
            <div className="navbar-end">
                <Theme />
                <Auth />
            </div>
        </nav>
    )
}

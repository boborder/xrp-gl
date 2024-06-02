"use client"
import { Imag } from "./Imag"
import { Auth } from "./Auth"
import { Theme } from './Theme'
import { useRouter } from 'next/navigation';
// import { SideBar } from "./SideBar";

export const Nav = () => {
    const router = useRouter();
    return (
        <nav className="navbar h-16 z-10 text-accent bg-opacity-80 absolute shadow">

            <div className="navbar-start">
                {/* <SideBar /> */}
                <button onMouseDown={() => router.replace("/")} className="w-11">
                    <Imag src={"/ipfs/logo.png"} width={44} height={44} alt="logo" />
                </button>
                <h1 className="ml-1 text-3xl">
                    XRP🌏GL
                </h1>
            </div>

            <div className="navbar-end">
                {/* テーマアイコンとサイインイン */}
                <Theme />
                <Auth />
            </div>
        </nav>
    )
}

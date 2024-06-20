"use client"
import { useRouter } from 'next/navigation';
import { Imag } from "@/components/Imag"
import { useUser } from "@/components/UserProvider"
import Link from 'next/link';

export const Auth = () => {
    const { user, xumm, store, gravatar, } = useUser();
    const router = useRouter();

    const connect = async () => {
        try {
            await xumm.authorize();
            window.location.reload()
            router.push(`/profile/${user.account || "user"}`)
        } catch (error) {
            console.error("Error during connection:", error);
        }
    };

    const logout = async () => {
        try {
            await xumm.logout();
            window.location.reload()
            router.push("/")
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        user?.account ? (
            <nav className="dropdown dropdown-end dropdown-hover">
                <button tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className='round-full w-12'>
                        <Imag
                            priority={true}
                            src={store?.avatar || gravatar || user.picture || "/ipfs/avatar.png"}
                            alt="avatar"
                            width={50} height={50}
                        />
                    </div>
                </button>
                <ul tabIndex={0} className="p-2 z-10 shadow menu menu-md dropdown-content bg-base-100 rounded-box w-auto bg-opacity-90">
                    <li>
                        <Link href="/">
                            <button className="btn btn-xs hover:text-primary">
                                Home
                            </button>
                            <span className="badge">🏠</span>
                        </Link>
                    </li>
                    <li>
                        <Link href={`/profile/${user.account || "user"}`}>
                            <button className="btn btn-xs hover:text-primary">Profile</button>
                            <span className="badge">🏴‍☠️</span>
                        </Link>
                    </li>
                    {/* <li>
                        <Link href="/test">
                            <button className="btn btn-xs hover:text-primary">Test</button>
                            <span className="badge">⚙️</span>
                        </Link>
                    </li> */}
                    <li>
                        <Link href="/">
                            <button className="btn btn-xs hover:text-primary">About</button>
                            <span className="badge">📚</span>
                        </Link>
                    </li>
                    <li>
                        <a onMouseDown={logout}>
                            <button className="btn btn-xs hover:text-primary" >Logout</button>
                            <span className="badge">bye...</span>
                        </a>
                    </li>
                </ul>
            </nav>
        ) : (
            <nav className="dropdown dropdown-end dropdown-hover">
                <button tabIndex={0} onClick={connect} className="btn btn-ghost">
                    <Imag
                        src={"/ipfs/xumm-icon.png"}
                        width={100}
                        height={50}
                        alt="sign"
                    />
                </button>
                <ul tabIndex={0} className="p-2 z-10 shadow menu menu-md dropdown-content bg-base-100 rounded-box w-auto bg-opacity-90">
                    <li>
                        <Link href="/">
                            <button className="btn btn-xs hover:text-primary">Home</button>
                        </Link>
                    </li>
                    {/* <li>
                        <a onMouseDown={() => router.push("/test")}>
                            <button className="btn btn-xs hover:text-primary">Test</button>
                            <span className="badge">⚙️</span>
                        </a>
                    </li> */}
                    <li>
                        <Link href="/">
                            <button className="btn btn-xs hover:text-primary">About</button>
                            <span className="badge">📚</span>
                        </Link>
                    </li>
                    <li>
                        <a onMouseDown={connect}>
                            <button className="btn btn-xs hover:text-primary" >Connect</button>
                            <span className="badge">🔑</span>
                        </a>
                    </li>
                </ul>
            </nav>
        )
    );
};

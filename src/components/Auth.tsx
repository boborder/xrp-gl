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
            // window.location.reload()
            router.push(`/profile/${user?.account || "user"}`)
        } catch (error) {
            console.error("Error during connection:", error);
        }
    };

    const logout = async () => {
        try {
            await xumm.logout();
            router.push("/")
            window.location.reload()
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        user?.account ? (
            <nav className="dropdown dropdown-end dropdown-hover h-12">
                <button tabIndex={0} className="btn-ghost btn-circle avatar">
                    <div className='rounded-full w-12'>
                    {/* <div className='w-12'> */}
                        <Imag
                            priority={true}
                            src={store?.avatar || gravatar || user.picture || "/ipfs/avatar.png"}
                            alt="avatar"
                            width={48} height={48}
                        />
                    </div>
                </button>
                <ul tabIndex={0} className="dropdown-content rounded-box">
                    <li>
                        <Link href="/">
                            <button className="btn-xs">
                                Home
                            </button>
                            <span className="badge">🏠</span>
                        </Link>
                    </li>
                    <li>
                        <Link href={`/profile/${user.account || "user"}`}>
                            <button className="btn-xs">Profile</button>
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
                            <button className="btn-xs">About</button>
                            <span className="badge">📚</span>
                        </Link>
                    </li>
                    <li>
                        <a onMouseDown={logout}>
                            <button className="btn-xs">Logout</button>
                            <span className="badge">bye...</span>
                        </a>
                    </li>
                </ul>
            </nav>
        ) : (
            <nav className="dropdown dropdown-end dropdown-hover h-12">
                <button tabIndex={0} onClick={connect} className="btn-ghost px-1">
                    <Imag
                        src={"/ipfs/xumm-icon.png"}
                        width={100}
                        height={48}
                        alt="sign"
                    />
                </button>
                <ul tabIndex={0} className="dropdown-content rounded-box">
                    <li>
                        <Link href="/">
                            <button className="btn-xs">Home</button>
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
                            <button className="btn-xs">About</button>
                            <span className="badge">📚</span>
                        </Link>
                    </li>
                    <li>
                        <a onMouseDown={connect}>
                            <button className="btn-xs">Connect</button>
                            <span className="badge">🔑</span>
                        </a>
                    </li>
                </ul>
            </nav>
        )
    );
};

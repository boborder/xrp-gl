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
                <button tabIndex={0} className="btn-ghost btn-circle avatar mx-1">
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
                    <li>
                        <Link href="/test">
                            <button className="btn-xs hover:text-primary">Test</button>
                            <span className="badge">⚙️</span>
                        </Link>
                    </li>
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
                <div tabIndex={0} onClick={connect} className="px-1">
                    <Imag
                        src={"/ipfs/xumm-icon.png"}
                        width={100}
                        height={48}
                        alt="sign"
                    />
                </div>
                <ul tabIndex={0} className="dropdown-content rounded-box">
                    <li>
                        <Link href="/">
                            <button className="btn-xs">Home</button>
                        </Link>
                    </li>
                    <li>
                        <div onMouseDown={() => router.push("/test")}>
                            <button className="btn-xs">Test</button>
                            <span className="badge">⚙️</span>
                        </div>
                    </li>
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

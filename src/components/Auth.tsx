"use client"
import { useRouter } from 'next/navigation';
import { Imag } from "@/components/Imag"
import { useUser } from "@/components/UserProvider"

export const Auth = () => {
    const { userInfo, xumm, avatar } = useUser();
    const router = useRouter();

    const connect = async () => {
        try {
            await xumm.authorize();
            router.refresh()
        } catch (error) {
            console.error("Error during connection:", error);
        }
    };

    const logout = async () => {
        try {
            await xumm.logout();
            router.refresh()
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        userInfo?.account ? (
            <nav className="dropdown dropdown-end dropdown-hover">
                <button tabIndex={0} className="btn btn-ghost btn-circle avatar">
                    <div className='round-full w-12'>
                        <Imag
                            priority={false}
                            src={avatar || userInfo.picture || "/ipfs/avatar.png"}
                            alt="Avatar"
                            width={50} height={50}
                        />
                    </div>
                </button>
                <ul tabIndex={0} className="p-2 z-10 shadow menu menu-md dropdown-content bg-base-100 rounded-box w-auto bg-opacity-90">
                    <li>
                        <a onMouseDown={() => router.replace("/")}>
                            <button className="btn btn-xs hover:text-primary">
                                Home
                            </button>
                            <span className="badge">🏠</span>
                        </a>
                    </li>
                    <li>
                        <a onMouseDown={() => router.push(`/profile/${userInfo.account}`)}>
                            <button className="btn btn-xs hover:text-primary">Profile</button>
                            <span className="badge">🏴‍☠️</span>
                        </a>
                    </li>
                    {/* <li>
                        <a onMouseDown={() => router.push("/test")}>
                            <button className="btn btn-xs hover:text-primary">Test</button>
                            <span className="badge">⚙️</span>
                        </a>
                    </li> */}
                    <li>
                        <a onMouseDown={() => router.push("/")}>
                            <button className="btn btn-xs hover:text-primary">About</button>
                            <span className="badge">📚</span>
                        </a>
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
                        <a onMouseDown={() => router.replace("/")}>
                            <button className="btn btn-xs hover:text-primary">Home</button>
                        </a>
                    </li>
                    {/* <li>
                        <a onMouseDown={() => router.push("/test")}>
                            <button className="btn btn-xs hover:text-primary">Test</button>
                            <span className="badge">⚙️</span>
                        </a>
                    </li> */}
                    <li>
                        <a onMouseDown={() => router.push("/")}>
                            <button className="btn btn-xs hover:text-primary">About</button>
                            <span className="badge">📚</span>
                        </a>
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

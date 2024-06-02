"use client"
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/components/UserProvider";
import { EditProfile } from "@/components/EditProfile";

export const runtime = 'edge';

export default function Profile() {
    const router = useRouter();
    const pathname = usePathname();
    const { userInfo } = useUser();

    useEffect(() => {
        // userInfoのアカウントが存在し、現在のpathnameとaccountが異なる場合、URLを置き換える
        if (userInfo.account && `/profile/${userInfo.account}` !== pathname) {
            router.replace(`/profile/${userInfo.account}`);
        }
        // アカウントが未定義の場合、ホームにリダイレクトする
        else if (userInfo.account === undefined) {
            router.replace("/")
        }
    }, [userInfo.account]);

    return (
        <>{userInfo.account ? <EditProfile /> : null}</>
    )
}

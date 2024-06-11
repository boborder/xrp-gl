"use client"
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/components/UserProvider";
import { EditProfile } from "@/components/EditProfile";

export const runtime = 'edge';

export default function Profile() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();

    useEffect(() => {
        // userInfoのアカウントが存在し、現在のpathnameとaccountが異なる場合、URLを置き換える
        if (user.account && `/profile/${user.account}` !== pathname) {
            router.replace(`/profile/${user.account}`);
        }
        // アカウントが未定義の場合、ホームにリダイレクトする
        else if (user.account === undefined) {
            router.replace("/")
        }
    }, [user.account]);

    return (
        <>{user.account ? <EditProfile /> : null}</>
    )
}

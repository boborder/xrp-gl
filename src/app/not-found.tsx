"use client"
import { Imag } from "@/components/Imag";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className='flex flex-col h-screen bg-background items-center justify-center'>
            <h1 className='text-4xl font-bold'>Uh oh! Page not found.</h1>
            <div className='mt-10 text-xl'>
                Go back { }
                <Link href={'/'} className='text-error hover:underline'>
                    Home &rarr;
                    <Imag
                        src={"/ipfs/404.png"}
                        width={360}
                        height={240}
                        alt="logo"
                        className="w-auto"
                    />
                </Link>
            </div>
        </div>
    );
}

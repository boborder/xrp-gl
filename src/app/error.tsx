"use client"
import { Imag } from "@/components/Imag";
import Link from "next/link";

export default function Error() {
    return (
        <div className='flex flex-col h-screen bg-background items-center justify-center'>
            <h1 className='text-5xl font-bold'>Something went wrong.</h1>
            <div className='mt-10 text-xl'>
                Please contact us for{ }
                <Link href={'/'} className='text-error hover:underline'>
                    help &rarr;
                    <Imag
                        src={"/ipfs/bg.png"}
                        width={360}
                        height={240}
                        alt="logo"
                        className="w-full"
                    />
                </Link>
            </div>
        </div>
    );
}

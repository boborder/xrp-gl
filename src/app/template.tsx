import { Nav } from "@/components/Nav"
import { Bnav } from "@/components/Bnav"

export default function template({ children, }: { children: React.ReactNode }) {
    return (
        <>
            <Nav />
            <main className="py-16 mx-auto container text-center text-primary-content">
                <div className='card border-primary border-2'>
                    {children}
                </div>
            </main>
            <Bnav />
        </>
    )
}

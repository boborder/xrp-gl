import { Header } from "@/components/Header"
import { Sidebar } from "@/components/SideBar"
import { Nav } from "@/components/Nav"
import { Footer } from "@/components/Footer"
import { Btm } from "@/components/Btm"
import { Alert } from "@/components/Alert"

export default function template({ children, }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <Sidebar />
            <main>
                <Nav/>
                <div className='content'>
                    {children}
                    <Alert />
                </div>
            </main>
            <Footer />
            <Btm />
        </>
    )
}

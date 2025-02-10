export default function loading() {
    return (
        <div className='flex flex-col h-screen bg-background items-center justify-center'>
            <h2 className="text-center text-3xl animate-pulse">loading...</h2>
            <div className="flex justify-center items-center">
                <span className="loading loading-infinity loading-lg"/>
                <span className="loading loading-infinity loading-lg"/>
                <span className="loading loading-infinity loading-lg"/>
                <span className="loading loading-infinity loading-lg"/>
                <span className="loading loading-infinity loading-lg"/>
            </div>
        </div>
    )
}

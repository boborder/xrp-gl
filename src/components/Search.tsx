
export const Search = () => {
    const search = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData?.get("query");

        const data = await fetch(`/api/get?name=${query}&account=${query}`, {
            method: "GET",
        });
        console.log(data)
    }

    return (
        <form onSubmit={search} className="form-control min-w-48">
        <div className="join">
            <input
                type="text"
                id="query"
                name="query"
                placeholder="Search"
                className="input input-bordered join-item w-full"
            />
            <button type="submit" className="btn join-item btn-neutral">🔍</button>
        </div>
    </form>
    );
}

"use client"

export const Search = () => {
    const search = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData?.get("query");

        const data = await fetch(`/api/get?name=${query}&account=${query}`, {
            method: "GET",
        });
        if (data) {
            const getData = await data.json()
            console.log(getData.result)
        }
    }

    return (
        <form onSubmit={search} className="min-w-48 join join-horizontal">
                <input
                    type="text"
                    id="query"
                    name="query"
                    placeholder="Search"
                    className="input input-bordered join-item w-full"
                />
                <button type="submit" className="join-item btn-neutral">🔍</button>
        </form>
    );
}

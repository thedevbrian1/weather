export async function loader({ request }) {
    // Fetch cities
    const q = new URL(await request.url).searchParams.get('q');

    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${q}`;
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '4fada16af8mshc89b1ab179222d4p1968d8jsn0df57d42e0c1',
            'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
    };

    const res = await fetch(url, options);
    const data = await res.json();
    // console.log({ data });
    const cities = data.data.map((city) => {
        return {
            id: city.id,
            name: city.name,
            country: city.country
        }
    });
    // console.log({ cities });

    return cities;
}
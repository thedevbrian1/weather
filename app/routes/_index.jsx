import { Form, Link, isRouteErrorResponse, useLoaderData, useLocation, useNavigation, useRouteError } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import Search from "../components/Search";

export const meta = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader({ request }) {
  const url = await request.url;
  const q = new URL(url).searchParams.get('q') ?? 'Nairobi';
  const res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${q}&appid=${process.env.OPENWEATHER_API_KEY}`);

  const location = await res.json();
  const { lat, lon } = location[0];

  // console.log({ location });

  const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);

  if (weatherRes.status === 404) {
    throw new Response({
      status: 404,
      statusText: 'Not found'
    });
  }
  const weather = await weatherRes.json();

  const weatherObj = {
    temp: weather.main.temp,
    location: location[0].name,
    icon: weather.weather[0].icon,
    cloudy: weather.clouds.all,
    humidity: weather.main.humidity,
    wind: weather.wind.speed
  };

  return json({ weatherObj });
}

export default function Index() {
  const data = useLoaderData();
  const navigation = useNavigation();
  // TODO: Fix pending UI. No pending UI when clicking 'home'
  // TODO: Clear search field in navigations (When using a location link)
  // TODO: Add suggestions combo box
  const isSearching = navigation.state === 'loading';

  const formRef = useRef();
  // const [inputValue, setInputValue] = useState('');

  const location = useLocation();
  // console.log({ location });

  const params = new URLSearchParams(location.search);
  const q = params.get('q') ?? '';

  // console.log({ q });

  const commonLocations = ['Nairobi', 'Mombasa', 'Nakuru', 'Kisumu', 'Marsabit'];

  // function handleChange(event) {
  //   setInputValue(event.target.value);
  // }

  // useEffect(() => {
  //   if (navigation.state === 'loading') {
  //     formRef.current?.reset();
  //   }
  // }, [navigation]);

  return (
    <main className="bg-[#7f9fb6] h-screen w-full pt-8 lg:pt-16">
      <div className=" lg:max-w-6xl mx-auto h-full">
        <Link to="/">
          <h1 className="font-bold text-4xl text-white ml-4 lg:ml-0">Weather</h1>
        </Link>
        {/* Image and today's weather */}
        <div className={`mt-4 flex flex-col lg:flex-row gap-x-4 justify-between ${(data.weatherObj.icon === '01d' || data.weatherObj.icon === '02d') ? "bg-[url('/blue-sky.webp')]" : "bg-[url('/gloomy-sky.jpg')]"} bg-center bg-no-repeat bg-cover   lg:h-3/4 text-white relative`}>
          <div className="lg:pt-72 pl-4 py-4 lg:py-0 lg:pl-10 order-2 lg:order-1">
            <span className="text-6xl font-semibold">
              {data.weatherObj.temp}&deg;C
              <img
                src={`https://openweathermap.org/img/wn/${data.weatherObj.icon}@2x.png`}
                alt=""
                className="inline"
              />
            </span>
            <span className="text-lg font-semibold">{data.weatherObj.location}</span>
          </div>
          <div className="order-1 lg:order-2 lg:w-96 pt-10 backdrop-blur-md px-2 lg:px-4 divide-y">
            {/* Search form and common locations */}
            <div>
              {/* <Form ref={formRef}>
                <input
                  type="search"
                  placeholder="Search location"
                  aria-label="Search"
                  name="q"
                 
                  className="bg-transparent px-3 py-2 border border-white rounded focus:outline-none focus:ring focus:ring-orange-500"
                />
                <button type="submit" className="bg-green-500 px-4 py-2 rounded ml-2 focus:outline-none focus:ring focus:ring-orange-500">
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </Form> */}
              {/* <Form> */}
              <Search />
              {/* <button type="submit" className="bg-green-500 px-4 py-2 rounded ml-2 focus:outline-none focus:ring focus:ring-orange-500">
                  {isSearching ? 'Searching...' : 'Search'}
                </button> */}
              {/* </Form> */}
              <div className="mt-4 px-2 lg:px-0">
                <h2 className="text-white font-semibold">Popular locations</h2>
                <ul className="text-gray-100 mt-2">
                  {commonLocations.map((location, index) => (
                    <li key={index} className="leading-8 hover:text-orange-500">
                      <Link
                        to={`/?q=${location}`}
                        prefetch="intent"
                        className="focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        {location}
                      </Link>
                    </li>
                  ))}

                </ul>
              </div>
            </div>
            <div className="text-gray-100 mt-4 pt-4 px-2 lg:px-0">
              <h2 className="text-white font-semibold">Weather details</h2>
              <div className="mt-2 flex justify-between">
                <span>
                  Cloudy:
                </span>
                <span className="text-white lg:text-slate-800 font-semibold">
                  {data.weatherObj.cloudy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  Humidity:
                </span>
                <span className="text-white lg:text-slate-800 font-semibold">
                  {data.weatherObj.humidity}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  Wind:
                </span>
                <span className="text-white lg:text-slate-800 font-semibold">
                  {data.weatherObj.wind} m/s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    console.log({ error: error.data });
    return (
      <div className="bg-[#7f9fb6] text-white text-center w-full h-screen grid place-items-center">
        <div>
          <h1 className="font-bold text-6xl mb-6">{error.status} {error.statusText}</h1>
          <Link to="/?q=Nairobi" className="underline hover:text-gray-200">
            Try again
          </Link>
        </div>
      </div>
    );
  } else if (error instanceof Error) {
    console.log({ error });
    return (
      <div className="bg-[#7f9fb6] text-white text-center w-full h-screen grid place-items-center">
        <div>
          <h1 className="font-bold text-6xl mb-6">Error</h1>
          <Link to="/?q=Nairobi" className="underline hover:text-gray-200">
            Try again
          </Link>
        </div>
      </div>
    );
  } else {
    return <h1>Unknown error</h1>
  }
}

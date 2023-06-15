import { Link, useFetcher } from "@remix-run/react";
import {
    Combobox,
    ComboboxInput,
    ComboboxPopover,
    ComboboxList,
    ComboboxOption,
} from "@reach/combobox";
import styles from "@reach/combobox/styles.css";
import { useEffect } from "react";
import Spinner from "./Spinner";

export function links() {
    return [
        { rel: "stylesheet", href: styles },
    ]
}
export default function Search() {
    const cityFetcher = useFetcher();

    const busy = cityFetcher.state !== 'idle';

    let timer;
    function handleChange(event) {
        clearTimeout(timer);
        timer = setTimeout(() => cityFetcher.submit(event.target.form), 1000);
    }

    useEffect(() => {
        return () => {
            clearTimeout(timer)
        }
    }, [])
    return (
        <cityFetcher.Form action="/resources/city">
            <Combobox aria-label='Cities'>
                <div className="relative">
                    <ComboboxInput
                        selectOnClick
                        name="q"
                        onChange={handleChange}
                        placeholder="Search location..."
                        className="text-white px-3 py-2 w-full rounded bg-transparent border border-white focus:outline-none focus:ring focus:ring-orange-500"
                    />
                    <Spinner showSpinner={busy} />
                </div>
                {cityFetcher.data ? (
                    <ComboboxPopover className="border border-slate-100 bg-white px-2">
                        {cityFetcher.data.error ? (
                            <p>Failed to load cities</p>
                        )
                            : cityFetcher.data.length ? (
                                <ComboboxList>
                                    {cityFetcher.data.map((city) => (

                                        <Link
                                            to={`/?q=${city.name}`}
                                            key={city.id}
                                        >
                                            <ComboboxOption
                                                value={`${city.name}, ${city.country}`}

                                            />

                                        </Link>
                                    ))}
                                </ComboboxList>
                            ) : (
                                <span>No results found</span>
                            )}
                    </ComboboxPopover>
                ) : null}
            </Combobox>
        </cityFetcher.Form>
    );
}
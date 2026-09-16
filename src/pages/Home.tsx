import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProviderLogo from "../components/ProviderLogo";
import { PROVIDER_LIST } from "../data/providers";
import { findAddresses, isLikelyPostcode } from "../lib/address";
import { useAppState } from "../store/AppState";
import type { ProviderSlug } from "../types";

export default function Home() {
  const navigate = useNavigate();
  const { state, setPostcodeSearch, selectAddress, selectAllProviders, setOnlyProvider } = useAppState();
  const [postcodeInput, setPostcodeInput] = useState(state.postcode);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(state.addresses.length > 0);

  function handleCheckAvailability(e: React.FormEvent) {
    e.preventDefault();
    if (!isLikelyPostcode(postcodeInput)) {
      setError("Enter a full postcode, e.g. PE7 8PD");
      return;
    }
    setError(null);
    const addresses = findAddresses(postcodeInput);
    setPostcodeSearch(postcodeInput, addresses);
    setShowResults(true);
  }

  function handleSelectAddress(address: string) {
    selectAddress(address);
    selectAllProviders();
    navigate("/deals");
  }

  function handleViewProviderDeals(slug: ProviderSlug) {
    if (!state.selectedAddress) {
      const fallbackPostcode = postcodeInput || "PE7 8PD";
      const addresses = findAddresses(fallbackPostcode);
      setPostcodeSearch(fallbackPostcode, addresses);
      selectAddress(addresses[0]);
    }
    setOnlyProvider(slug);
    navigate("/deals");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <section className="mx-auto max-w-[1728px] px-6 pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0b0b12] px-10 py-14 text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(60% 80% at 20% 30%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(50% 70% at 80% 20%, rgba(6,182,212,0.3), transparent 55%), radial-gradient(60% 60% at 60% 90%, rgba(236,72,153,0.25), transparent 60%)",
            }}
          />
          <div className="relative">
            <p className="text-sm font-medium text-gray-300 mb-3">Broadband marketplace</p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl">
              Get affordable broadband deals around you
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl">
              Grab superfast, reliable broadband packages that best fits your need
            </p>

            <form
              onSubmit={handleCheckAvailability}
              className="mt-8 flex flex-col sm:flex-row gap-3 bg-white rounded-2xl sm:rounded-full p-2 shadow-xl max-w-3xl"
            >
              <input
                value={postcodeInput}
                onChange={(e) => setPostcodeInput(e.target.value)}
                placeholder="Enter your postcode"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder:text-gray-400 outline-none"
                aria-label="Postcode"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold whitespace-nowrap"
              >
                Check for availability
              </button>
            </form>
            {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}

            {showResults && state.addresses.length > 0 && (
              <div className="mt-6 max-w-3xl rounded-2xl bg-white text-gray-900 shadow-2xl overflow-hidden">
                <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-bold text-lg">Select address</h2>
                    <p className="text-sm text-gray-500">
                      {state.addresses.length} addresses found around {state.postcode.toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResults(false)}
                    aria-label="Close address results"
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    ✕
                  </button>
                </div>
                <ul>
                  {state.addresses.map((address) => (
                    <li key={address} className="border-b border-gray-50 last:border-0">
                      <button
                        onClick={() => handleSelectAddress(address)}
                        className="w-full text-left px-6 py-4 hover:bg-indigo-50 transition-colors"
                      >
                        {address}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1728px] px-6 py-10">
        <div className="rounded-3xl bg-white shadow-sm p-8">
          <h2 className="text-2xl font-extrabold">Top dealers</h2>
          <p className="text-gray-500 mt-1">View several broadband deal offerings from our top dealers</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PROVIDER_LIST.map((provider) => (
              <div
                key={provider.slug}
                className="rounded-2xl border border-gray-100 p-5 flex flex-col items-center gap-3 text-center hover:shadow-md transition-shadow"
              >
                <ProviderLogo provider={provider.slug} size={56} />
                <span className="font-semibold">{provider.name}</span>
                <button
                  onClick={() => handleViewProviderDeals(provider.slug)}
                  className="w-full py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-sm font-semibold"
                >
                  View deals
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

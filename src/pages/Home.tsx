import { AddressPicker, DealerTile, HeroSearch, Panel } from "@aptap/design-system";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { PROVIDER_LIST, providerLogo } from "../data/providers";
import { findAddresses } from "../lib/address";
import { availableProvidersFor } from "../lib/availability";
import { useAppState } from "../store/AppState";
import type { ProviderSlug } from "../types";

export default function Home() {
  const navigate = useNavigate();
  const { state, deals, setPostcodeSearch, selectAddress, setProviders, setOnlyProvider } = useAppState();
  const [showResults, setShowResults] = useState(state.addresses.length > 0);

  function handleSearch(postcode: string) {
    const addresses = findAddresses(postcode);
    setPostcodeSearch(postcode, addresses);
    setShowResults(true);
  }

  function handleSelectAddress(address: string) {
    selectAddress(address);
    setProviders(availableProvidersFor(deals.deals, state.postcode));
    navigate("/deals");
  }

  function handleViewProviderDeals(slug: ProviderSlug) {
    const fallbackPostcode = state.selectedAddress ? state.postcode : "PE7 8PD";
    if (!state.selectedAddress) {
      const addresses = findAddresses(fallbackPostcode);
      setPostcodeSearch(fallbackPostcode, addresses);
      selectAddress(addresses[0]);
    }
    setOnlyProvider(slug);
    navigate("/deals");
  }

  return (
    <div>
      <Header />

      <div className="ap-container" style={{ paddingTop: "var(--ap-spacing-6)" }}>
        <HeroSearch
          title="Get affordable broadband deals around you"
          lede="Grab superfast, reliable broadband packages that best fit your need"
          initialPostcode={state.postcode}
          onSearch={handleSearch}
        >
          {deals.error && (
            <p className="ap-hero-search__lede" role="alert">
              We couldn't load today's deals ({deals.error}). Try refreshing the page.
            </p>
          )}
          {showResults && state.addresses.length > 0 && (
            <AddressPicker
              postcode={state.postcode.toUpperCase()}
              addresses={state.addresses}
              onSelect={handleSelectAddress}
              onClose={() => setShowResults(false)}
            />
          )}
        </HeroSearch>
      </div>

      <div className="ap-container" style={{ paddingBlock: "var(--ap-spacing-8)" }}>
        <Panel title="Top dealers" subtitle="View several broadband deal offerings from our top dealers">
          <div className="ap-dealer-grid">
            {PROVIDER_LIST.map((provider) => {
              const logo = providerLogo(provider.slug);
              return (
                <DealerTile
                  key={provider.slug}
                  provider={provider.name}
                  logoSrc={logo.src}
                  logoFill={logo.fill}
                  onView={() => handleViewProviderDeals(provider.slug)}
                />
              );
            })}
          </div>
          {deals.updatedAt && (
            <p className="ap-footnote" style={{ marginTop: "var(--ap-spacing-6)" }}>
              Deals checked{" "}
              {new Date(deals.updatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              . Headline prices from each provider's own website — actual price and availability depend on
              your address. TalkTalk and Community Fibre aren't included yet.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}

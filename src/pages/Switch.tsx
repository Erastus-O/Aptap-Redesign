import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ProviderLogo from "../components/ProviderLogo";
import { getDeal } from "../data/deals";
import { PROVIDER_LIST, PROVIDERS } from "../data/providers";
import { currentYearOptions, formatPrice, incentiveLabel, MONTHS } from "../lib/format";
import { useAppState } from "../store/AppState";

const STEP_LABELS = ["Your current setup", "Contact & install", "Review & confirm"];

export default function Switch() {
  const navigate = useNavigate();
  const { state, setSwitchStep, updateSwitchForm, resetSwitchFlow } = useAppState();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference] = useState(() => `APT-${Math.floor(100000 + Math.random() * 900000)}`);

  const deal = state.chosenDealId ? getDeal(state.chosenDealId) : undefined;

  useEffect(() => {
    if (!deal) navigate("/deals", { replace: true });
  }, [deal, navigate]);

  if (!deal) return null;

  const provider = PROVIDERS[deal.provider];
  const step = state.switchStep;
  const form = state.switchForm;

  function goToStep(next: number) {
    setErrors({});
    setSwitchStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateStep1() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Enter your full name as it appears on the bill";
    if (!form.currentProvider) e.currentProvider = "Select your current provider";
    if (!form.contractEndMonth || !form.contractEndYear) e.contractEnd = "Select when your contract ends";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e: Record<string, string> = {};
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Enter a valid email address";
    if (!form.phone.trim()) e.phone = "Enter a contact phone number";
    if (!form.preferredInstallDate) e.preferredInstallDate = "Choose a preferred installation date";
    if (!form.preferredInstallSlot) e.preferredInstallSlot = "Choose a preferred time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-2xl bg-white shadow-sm p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-5">
              ✓
            </div>
            <h1 className="text-2xl font-extrabold mb-2">You're all set, {form.fullName.split(" ")[0]}!</h1>
            <p className="text-gray-500 mb-6">
              We've started your switch to {provider.name} {deal.planName}. Your reference number is{" "}
              <span className="font-semibold text-gray-800">{reference}</span>.
            </p>
            <div className="rounded-xl bg-gray-50 p-5 text-left mb-8">
              <p className="text-sm text-gray-500 mb-1">Installation preference</p>
              <p className="font-semibold mb-4">
                {form.preferredInstallDate} · {form.preferredInstallSlot}
              </p>
              <p className="text-sm text-gray-500 mb-1">We'll contact you at</p>
              <p className="font-semibold">
                {form.email} · {form.phone}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  resetSwitchFlow();
                  navigate("/deals");
                }}
                className="px-6 py-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-medium"
              >
                Browse more deals
              </button>
              <button
                onClick={() => {
                  resetSwitchFlow();
                  navigate("/");
                }}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold"
              >
                Back to marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl bg-white shadow-sm p-6 mb-6">
          <p className="text-xs font-bold tracking-wide text-gray-400 mb-4">SELECTED BROADBAND</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ProviderLogo provider={deal.provider} size={40} />
              <div>
                <h2 className="font-bold text-lg leading-tight">{deal.planName}</h2>
                <p className="text-sm text-gray-500">
                  {provider.name} · {deal.connection}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full px-3 py-1">
                🎁 {incentiveLabel(deal)}
              </span>
              {deal.priceFixedForTerm && (
                <span className="text-xs font-medium bg-amber-50 text-amber-700 rounded-full px-3 py-1">
                  Price fixed for the term
                </span>
              )}
            </div>
            <button
              onClick={() => {
                resetSwitchFlow();
                navigate("/deals");
              }}
              className="px-4 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-sm w-fit"
            >
              Change deal
            </button>
          </div>
          <div className="flex gap-10 mt-4">
            <div>
              <p className="text-xs text-gray-400">Speed</p>
              <p className="font-semibold">{deal.speedMbps}mb</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Monthly price</p>
              <p className="font-semibold">{formatPrice(deal.priceMonthly)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Contract</p>
              <p className="font-semibold">{deal.contractMonths} months</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm p-6">
          <h1 className="text-xl font-extrabold mb-1">Let's get you that Broadband deal</h1>
          <p className="text-gray-500 text-sm mb-5">
            You've picked {provider.name} {deal.planName}. {formatPrice(deal.priceMonthly)}/month. We just
            need to confirm your current setup
          </p>

          <p className="text-sm font-semibold mb-2">
            Step {step} of 3 <span className="text-gray-400 font-normal">— {STEP_LABELS[step - 1]}</span>
          </p>
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-[#0b0b12]" : "bg-gray-200"}`}
              />
            ))}
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Confirm your Fullname</label>
                <input
                  value={form.fullName}
                  onChange={(e) => updateSwitchForm({ fullName: e.target.value })}
                  placeholder="Enter your fullname as it is on the bill"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400"
                />
                {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Who's your broadband with now?</label>
                <select
                  value={form.currentProvider}
                  onChange={(e) => updateSwitchForm({ currentProvider: e.target.value as never })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 bg-white"
                >
                  <option value="">Select your current provider</option>
                  {PROVIDER_LIST.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                  <option value="other">Someone else / no broadband</option>
                </select>
                {errors.currentProvider && (
                  <p className="text-xs text-rose-600 mt-1">{errors.currentProvider}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">When does your contract end?</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={form.contractEndMonth}
                    onChange={(e) => updateSwitchForm({ contractEndMonth: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={form.contractEndYear}
                    onChange={(e) => updateSwitchForm({ contractEndYear: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400 bg-white"
                  >
                    <option value="">Year</option>
                    {currentYearOptions().map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.contractEnd && <p className="text-xs text-rose-600 mt-1">{errors.contractEnd}</p>}
              </div>

              <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                We would check if you're free to switch without an exit fee. If you're still in contract,
                we'll tell you before you commit, this won't stop you from continuing now
              </p>

              <button
                onClick={() => validateStep1() && goToStep(2)}
                className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold"
              >
                Proceed to switch deal
              </button>
              <p className="text-center text-xs text-gray-400">Your details are only used to process this switch</p>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2">Email address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateSwitchForm({ email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400"
                />
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Phone number</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateSwitchForm({ phone: e.target.value })}
                  placeholder="07123 456789"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400"
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Installation address</label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
                  <span className="text-sm">{state.selectedAddress}</span>
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.installAddressConfirmed}
                      onChange={(e) => updateSwitchForm({ installAddressConfirmed: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500"
                    />
                    This is correct
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Preferred installation date</label>
                <input
                  type="date"
                  value={form.preferredInstallDate}
                  onChange={(e) => updateSwitchForm({ preferredInstallDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-indigo-400"
                />
                {errors.preferredInstallDate && (
                  <p className="text-xs text-rose-600 mt-1">{errors.preferredInstallDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Preferred time slot</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Morning", "Afternoon", "Evening"].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => updateSwitchForm({ preferredInstallSlot: slot })}
                      className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                        form.preferredInstallSlot === slot
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {errors.preferredInstallSlot && (
                  <p className="text-xs text-rose-600 mt-1">{errors.preferredInstallSlot}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => goToStep(1)}
                  className="flex-1 py-3.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => validateStep2() && goToStep(3)}
                  className="flex-[2] py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-semibold"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-gray-50 p-5 flex flex-col gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Full name</span>
                  <span className="font-semibold">{form.fullName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current provider</span>
                  <span className="font-semibold">
                    {form.currentProvider === "other"
                      ? "Someone else / no broadband"
                      : form.currentProvider
                        ? PROVIDERS[form.currentProvider].name
                        : "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current contract ends</span>
                  <span className="font-semibold">
                    {form.contractEndMonth} {form.contractEndYear}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-semibold">
                    {form.email} · {form.phone}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Installation address</span>
                  <span className="font-semibold text-right">{state.selectedAddress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Installation slot</span>
                  <span className="font-semibold">
                    {form.preferredInstallDate} · {form.preferredInstallSlot}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                By confirming, you agree to switch your broadband to {provider.name} {deal.planName} at{" "}
                {formatPrice(deal.priceMonthly)}/month on an {deal.contractMonths}-month contract. You can
                cancel free of charge within 14 days.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => goToStep(2)}
                  className="flex-1 py-3.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => goToStep(4)}
                  className="flex-[2] py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 transition-colors text-white font-semibold"
                >
                  Confirm switch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import {
  Alert,
  Button,
  Checkbox,
  Icons,
  Panel,
  SegmentedControl,
  SelectField,
  SelectedDeal,
  StepProgress,
  TextField,
} from "@aptap/design-system";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { PROVIDER_LIST, PROVIDERS, providerLogo } from "../data/providers";
import { currentYearOptions, isMoreThan30DaysOut, MONTHS } from "../lib/format";
import { useAppState } from "../store/AppState";

const STEP_LABELS = ["Your current setup", "Contact & install", "Review & confirm"];

export default function Switch() {
  const navigate = useNavigate();
  const { state, deals, setSwitchStep, updateSwitchForm, resetSwitchFlow } = useAppState();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference] = useState(() => `APT-${Math.floor(100000 + Math.random() * 900000)}`);

  const deal = state.chosenDealId ? deals.deals.find((d) => d.id === state.chosenDealId) : undefined;

  useEffect(() => {
    if (!deals.loading && !deal) navigate("/deals", { replace: true });
  }, [deals.loading, deal, navigate]);

  if (!deal) return null;

  const provider = PROVIDERS[deal.provider];
  const logo = providerLogo(deal.provider);
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
      <div>
        <Header />
        <div className="ap-container ap-container--reading" style={{ paddingBlock: "var(--ap-spacing-10)" }}>
          <div className="ap-panel" style={{ textAlign: "center" }}>
            <div
              className="ap-avatar ap-avatar--lg"
              style={{ margin: "0 auto var(--ap-spacing-4)", color: "var(--ap-color-content-success, green)" }}
              aria-hidden="true"
            >
              <Icons.CheckCircle size="xl" />
            </div>
            <h1 className="ap-text-h2">You're all set, {form.fullName.split(" ")[0]}!</h1>
            <p className="ap-muted">
              We've started your switch to {provider.name} {deal.name}. Your reference number is{" "}
              <strong>{reference}</strong>.
            </p>
            <div className="ap-inset" style={{ textAlign: "left", margin: "var(--ap-spacing-6) 0" }}>
              <dl className="ap-kv">
                <div>
                  <dt>Installation preference</dt>
                  <dd>
                    {form.preferredInstallDate} · {form.preferredInstallSlot}
                  </dd>
                </div>
                <div>
                  <dt>We'll contact you at</dt>
                  <dd>
                    {form.email} · {form.phone}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="ap-cluster" style={{ justifyContent: "center" }}>
              <Button
                variant="secondary"
                onClick={() => {
                  resetSwitchFlow();
                  navigate("/deals");
                }}
              >
                Browse more deals
              </Button>
              <Button
                onClick={() => {
                  resetSwitchFlow();
                  navigate("/");
                }}
              >
                Back to marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="ap-container ap-container--reading" style={{ paddingBlock: "var(--ap-spacing-8)" }}>
        <div className="ap-stack ap-stack--section">
          <SelectedDeal
            deal={deal}
            logoSrc={logo.src}
            logoFill={logo.fill}
            onChange={() => {
              resetSwitchFlow();
              navigate("/deals");
            }}
          />

          <Panel>
            <h1 className="ap-text-h3">Let's get you that broadband deal</h1>
            <p className="ap-muted">
              You've picked {provider.name} {deal.name}. We just need to confirm your current setup.
            </p>
            <StepProgress current={step} total={3} label={STEP_LABELS[step - 1]} />

            {step === 1 && (
              <div className="ap-stack">
                <TextField
                  label="Confirm your full name"
                  placeholder="Enter your full name as it is on the bill"
                  value={form.fullName}
                  onChange={(e) => updateSwitchForm({ fullName: e.target.value })}
                  error={errors.fullName}
                />

                <SelectField
                  label="Who's your broadband with now?"
                  placeholder="Select your current provider"
                  value={form.currentProvider}
                  onChange={(e) => updateSwitchForm({ currentProvider: e.target.value as never })}
                  options={[
                    ...PROVIDER_LIST.map((p) => ({ value: p.slug, label: p.name })),
                    { value: "other", label: "Someone else / no broadband" },
                    { value: "not_sure", label: "Not sure" },
                  ]}
                />

                <Field2Row>
                  <SelectField
                    label="Contract end month"
                    placeholder="Month"
                    value={form.contractEndMonth}
                    onChange={(e) => updateSwitchForm({ contractEndMonth: e.target.value })}
                    options={[...MONTHS.map((m) => ({ value: m, label: m })), { value: "not_sure", label: "Not sure" }]}
                  />
                  <SelectField
                    label="Contract end year"
                    placeholder="Year"
                    value={form.contractEndYear}
                    onChange={(e) => updateSwitchForm({ contractEndYear: e.target.value })}
                    options={[...currentYearOptions().map((y) => ({ value: y, label: y })), { value: "not_sure", label: "Not sure" }]}
                  />
                </Field2Row>

                {isMoreThan30DaysOut(form.contractEndMonth, form.contractEndYear) && (
                  <Alert tone="warning" live>
                    You may still be in contract until {form.contractEndMonth} {form.contractEndYear}. We'll
                    confirm this with you before you commit — it won't stop you from continuing now.
                  </Alert>
                )}

                <p className="ap-footnote">
                  We'll check if you're free to switch without an exit fee. If you're still in contract, we'll
                  tell you before you commit — this won't stop you from continuing now.
                </p>

                <Button block onClick={() => validateStep1() && goToStep(2)}>
                  Proceed to switch deal
                </Button>
                <p className="ap-footnote ap-footnote--center">Your details are only used to process this switch</p>
              </div>
            )}

            {step === 2 && (
              <div className="ap-stack">
                <TextField
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => updateSwitchForm({ email: e.target.value })}
                  error={errors.email}
                />

                <TextField
                  label="Phone number"
                  placeholder="07123 456789"
                  value={form.phone}
                  onChange={(e) => updateSwitchForm({ phone: e.target.value })}
                  error={errors.phone}
                />

                <div className="ap-field">
                  <span className="ap-field__label">Installation address</span>
                  <div className="ap-cluster" style={{ justifyContent: "space-between" }}>
                    <span>{state.selectedAddress}</span>
                    <Checkbox
                      label="This is correct"
                      checked={form.installAddressConfirmed}
                      onChange={(e) => updateSwitchForm({ installAddressConfirmed: e.target.checked })}
                    />
                  </div>
                </div>

                <TextField
                  label="Preferred installation date"
                  type="date"
                  value={form.preferredInstallDate}
                  onChange={(e) => updateSwitchForm({ preferredInstallDate: e.target.value })}
                  error={errors.preferredInstallDate}
                />

                <div className="ap-field">
                  <span className="ap-field__label">Preferred time slot</span>
                  <SegmentedControl
                    label="Preferred time slot"
                    value={form.preferredInstallSlot || "Morning"}
                    onChange={(v) => updateSwitchForm({ preferredInstallSlot: v })}
                    options={[
                      { value: "Morning", label: "Morning" },
                      { value: "Afternoon", label: "Afternoon" },
                      { value: "Evening", label: "Evening" },
                    ]}
                  />
                  {errors.preferredInstallSlot && <p className="ap-field__error">{errors.preferredInstallSlot}</p>}
                </div>

                <div className="ap-cluster">
                  <Button variant="secondary" block onClick={() => goToStep(1)}>
                    Back
                  </Button>
                  <Button block onClick={() => validateStep2() && goToStep(3)}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="ap-stack">
                <div className="ap-inset">
                  <dl className="ap-kv">
                    <div>
                      <dt>Full name</dt>
                      <dd>{form.fullName}</dd>
                    </div>
                    <div>
                      <dt>Current provider</dt>
                      <dd>
                        {form.currentProvider === "other"
                          ? "Someone else / no broadband"
                          : form.currentProvider === "not_sure" || !form.currentProvider
                            ? "Not sure"
                            : PROVIDERS[form.currentProvider].name}
                      </dd>
                    </div>
                    <div>
                      <dt>Current contract ends</dt>
                      <dd>
                        {form.contractEndMonth === "not_sure" ||
                        form.contractEndYear === "not_sure" ||
                        (!form.contractEndMonth && !form.contractEndYear)
                          ? "Not sure"
                          : `${form.contractEndMonth} ${form.contractEndYear}`}
                      </dd>
                    </div>
                    <div>
                      <dt>Contact</dt>
                      <dd>
                        {form.email} · {form.phone}
                      </dd>
                    </div>
                    <div>
                      <dt>Installation address</dt>
                      <dd>{state.selectedAddress}</dd>
                    </div>
                    <div>
                      <dt>Installation slot</dt>
                      <dd>
                        {form.preferredInstallDate} · {form.preferredInstallSlot}
                      </dd>
                    </div>
                  </dl>
                </div>

                <p className="ap-footnote">
                  By confirming, you agree to switch your broadband to {provider.name} {deal.name}. You can
                  cancel free of charge within 14 days.
                </p>

                <div className="ap-cluster">
                  <Button variant="secondary" block onClick={() => goToStep(2)}>
                    Back
                  </Button>
                  <Button block onClick={() => goToStep(4)}>
                    Confirm switch
                  </Button>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Field2Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--ap-spacing-3)" }}>{children}</div>;
}

import { PartnerHeader } from "@aptap/design-system";
import { useNavigate } from "react-router-dom";
import aptapLogo from "../assets/logos/aptap.png";
import barclaysLogo from "../assets/logos/barclays.png";

export default function Header() {
  const navigate = useNavigate();

  return (
    <PartnerHeader
      onBack={() => navigate("/")}
      aptapLogo={aptapLogo}
      partnerName="Barclays"
      partnerLogo={barclaysLogo}
    />
  );
}

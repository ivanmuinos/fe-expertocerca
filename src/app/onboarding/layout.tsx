import OnboardingChrome from "./OnboardingChrome";
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingChrome>{children}</OnboardingChrome>;
}

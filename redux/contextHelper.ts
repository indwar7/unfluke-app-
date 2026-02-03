import { createContext, Dispatch, SetStateAction, useContext } from "react";
interface OnboardingContextType {
  onFinish: () => void;
  restart: () => void;
  onBoarding: boolean;
  isLoggingOut: boolean;
  setIsLoggingOut: Dispatch<SetStateAction<boolean>>;
}
export const OnboardingContext = createContext<OnboardingContextType>({
  onFinish: () => {},
  restart: () => {},
  onBoarding: true,
  isLoggingOut: false,
  setIsLoggingOut: () => {}, // temporary placeholder, matches Dispatch
});

export const useOnboarding = () => useContext(OnboardingContext);
import { SafeAreaView } from "react-native-safe-area-context";

import {
  localeIcon,
  onboardingGlobe,
  onboardingIconCheckin,
} from "@/assets/images";
import { MultiCardCarousel } from "@/components/complex";
import { CardCarousel } from "@/components/complex/multi-card-carousel";
import { globalStyles } from "@/styles/global.styles";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  const cards: CardCarousel[] = [
    {
      id: 1,
      image: localeIcon,
      title: "Encontre sua caverna",
      subtitle:
        "Localizamos as cavernas mais próximas de você, onde quer que esteja.",
    },
    {
      id: 2,
      image: onboardingGlobe,
      title: "Faixa justa, em qualquer unidade",
      subtitle:
        "Sua trilha técnica segue o padrão da CBJJ — treine em cavernas diferentes sem perder seu progresso.",
    },
    {
      id: 3,
      image: onboardingIconCheckin,
      title: "Presença que conta de verdade",
      subtitle:
        "Check-in automático registra suas horas de tatame — sem depender de caderno ou planilha.",
    },
  ];

  const handleNext = () => {
    router.push("/onboarding/location-permission");
  };

  return (
    <SafeAreaView style={[globalStyles.screen, globalStyles.center]}>
      <MultiCardCarousel
        cards={cards}
        secondaryBtn={{
          action: (currentIndex: number) => {
            const isEndCarousel = currentIndex === cards.length - 1;
            if (isEndCarousel) handleNext();
          },
          label: "Avançar",
        }}
        primaryBtn={{
          action: () => handleNext(),
          label: "Pular",
        }}
      />
    </SafeAreaView>
  );
}

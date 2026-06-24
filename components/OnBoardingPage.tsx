import { useState } from "react";
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";

import OnboardingImage from "./Images/Onboarding";
import OnboardingImage2 from "./Images/Onboarding2";
import OnboardingImage3 from "./Images/Onboarding3";
import { useNavigation } from "@react-navigation/native";
import { useWindowDimensions } from "react-native";
import { logCompleteTutorial } from "../helpers/facebookEvents";

const onboardingData = [
  {
    title: "Take hold of your finances",
    description:
      "Lets get you to be the Controller of your Finances and get great returns.",
    image: <OnboardingImage />,
  },
  {
    title: "Smart trading tools",
    description: "Manage and categorize your spending in one place.",
    image: <OnboardingImage2 />,
  },
  {
    title: "Invest in the future",
    description:
      "Set goals and monitor your progress toward financial success.",
    image: <OnboardingImage3 />,
  },
];


export const OnBoardingPage = () => {
  const {width,height} = useWindowDimensions()
  const [currentIndex, setCurrentIndex] = useState(0);
  const { title, description, image } = onboardingData[currentIndex];
  const navigation = useNavigation();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log("Onboarding complete");
      setCurrentIndex(0); // Reset or navigate
    }
  };

  return (
    <View style={styles.container}>
      {/* SVG Illustration */}
      <View
        style={[
          styles.imageContainer,
          currentIndex === 0
            ? { marginTop: height * 0.1 }
            : currentIndex === 1
            ? { marginTop: height * 0.2 }
            : { marginTop: height * 0.2 },
        ]}
      >
        {image}
      </View>

      {/* Content Section */}
      <View style={[styles.contentContainer,{bottom: height * 0.12}]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Image
          source={require("../assets/Vector.jpg")}
          style={styles.vectorBackground}
        />
{currentIndex == 2 ? (
        <TouchableOpacity style={styles.button} onPress={() => {
          logCompleteTutorial(true, "onboarding");
          navigation.navigate("registerpage" as never);
        }}>
            <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
           ):( <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>)}
        {/* {currentIndex == 2 && <Button title="Get Started" onPress={onFinish} />} */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    position: "absolute",
  },
  title: {
    color: "#11183C",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 40,
  },
  description: {
    color: "#11183C",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
  vectorBackground: {
    position: "absolute",
    bottom: -10,
    zIndex: -1,
    resizeMode: "contain",
    width: "100%",
  },

  button: {
    backgroundColor: "#3F5189",
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: 280,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

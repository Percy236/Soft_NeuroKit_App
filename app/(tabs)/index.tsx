import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🧠</Text>

        <Text style={styles.title}>Soft NeuroKit</Text>

        <Text style={styles.subtitle}>
          Real-time biosignal monitoring (EEG, EDA, ECG)
        </Text>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Connect Live</Text>
          <Text style={styles.boxText}>
            Connect to your wearable device and visualize live data.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/bluetooth")}
        >
          <Text style={styles.buttonText}>Connect Device</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Senior Design • Version 1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    textAlign: "center",
    color: "#475569",
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
  },
  box: {
    marginTop: 20,
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    width: "100%",
  },
  boxTitle: {
    fontWeight: "bold",
    color: "#1e293b",
    fontSize: 15,
  },
  boxText: {
    marginTop: 5,
    color: "#475569",
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    padding: 14,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  footer: {
    marginTop: 15,
    fontSize: 11,
    color: "#94a3b8",
  },
});

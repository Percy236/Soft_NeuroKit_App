import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";

const TARGET_SERVICE_UUID = "f1debc9a-7856-3412-f0de-bc9a78563412";
const TARGET_NOTIFY_UUID = "f2debc9a-7856-3412-f0de-bc9a78563412";

const normalizeUUID = (uuid: string) => uuid.replace(/-/g, "").toLowerCase();

export default function BluetoothScreen() {
  const managerRef = useRef(new BleManager());
  const manager = managerRef.current;

  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [characteristicRef, setCharacteristicRef] = useState<any>(null);
  const [isTargetDevice, setIsTargetDevice] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [dataBuffer, setDataBuffer] = useState<any[]>([]);
  const dataBufferRef = useRef<any[]>([]);

  const [ch3, setCh3] = useState<number | null>(null);
  const [ch4, setCh4] = useState<number | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS !== "android") return true;

    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    return Object.values(result).every(
      (value) => value === PermissionsAndroid.RESULTS.GRANTED,
    );
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);

  const scanDevices = async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    setDevices([]);
    setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        setIsScanning(false);
        return;
      }

      if (!device) return;

      const name = device.name || device.localName;
      if (!name) return;

      setDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  // From first code: proper characteristic finder that returns the char object
  const findCharacteristic = async (device: Device) => {
    const services = await device.services();

    for (const service of services) {
      console.log("SERVICE UUID:", service.uuid);
      if (normalizeUUID(service.uuid) === normalizeUUID(TARGET_SERVICE_UUID)) {
        const characteristics = await service.characteristics();

        for (const char of characteristics) {
          console.log("CHAR UUID:", char.uuid);
          if (normalizeUUID(char.uuid) === normalizeUUID(TARGET_NOTIFY_UUID)) {
            return char;
          }
        }
      }
    }

    return null;
  };

  const connectToDevice = async (device: Device) => {
    try {
      manager.stopDeviceScan();

      const connected = await device.connect();
      const discovered =
        await connected.discoverAllServicesAndCharacteristics();

      setConnectedDevice(discovered);

      const char = await findCharacteristic(discovered);

      if (!char) {
        setIsTargetDevice(false);
        Alert.alert("Connected", "No compatible data service");
        return;
      }

      setCharacteristicRef(char);
      setIsTargetDevice(true);
      Alert.alert("Connected", "Ready to record");
    } catch (error) {
      console.log("Connection error:", error);
      Alert.alert("Connection Failed");
    }
  };

  // From first code: proper subscription management
  const startRecording = () => {
    if (!characteristicRef) return;

    dataBufferRef.current = [];
    setDataBuffer([]);
    isRecordingRef.current = true;
    setIsRecording(true);

    const sub = characteristicRef.monitor((error: any, characteristic: any) => {
      if (error) {
        console.log("Notify error:", error);
        return;
      }

      if (!characteristic?.value) return;

      const buffer = Buffer.from(characteristic.value, "base64");

      if (buffer.length !== 8) return;

      const ch3Val = buffer.readInt32BE(0);
      const ch4Val = buffer.readInt32BE(4);

      setCh3(ch3Val);
      setCh4(ch4Val);

      if (isRecordingRef.current) {
        const newEntry = {
          timestamp: Date.now(),
          ch3: ch3Val,
          ch4: ch4Val,
        };

        dataBufferRef.current = [...dataBufferRef.current, newEntry];
        setDataBuffer((prev) => [...prev, newEntry]);
      }

      console.log("DATA:", ch3Val, ch4Val);
    });

    setSubscription(sub);
  };

  const saveCSV = async () => {
    const bufferCopy =
      dataBufferRef.current.length > 0
        ? [...dataBufferRef.current]
        : [...dataBuffer];

    if (bufferCopy.length === 0) {
      console.log("No data to save");
      return;
    }

    // Create timestamp-based filename that stays unique across quick sessions.
    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    const fileName = `session_${month}_${day}_${hours}${minutes}${seconds}_${milliseconds}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;

    // Build CSV content
    const header = "timestamp,ch3,ch4\n";

    const rows = bufferCopy
      .map((d) => `${d.timestamp},${d.ch3},${d.ch4}`)
      .join("\n");

    const csv = header + rows;

    try {
      await FileSystem.writeAsStringAsync(fileUri, csv);
      console.log("Saved file:", fileUri);
    } catch (error) {
      console.log("Error saving file:", error);
    }
  };

  const stopRecording = async () => {
    subscription?.remove();
    setSubscription(null);
    isRecordingRef.current = false;
    setIsRecording(false);
    await saveCSV();
  };

  const disconnectDevice = async () => {
    subscription?.remove();

    if (connectedDevice) {
      await connectedDevice.cancelConnection();
    }

    setConnectedDevice(null);
    setCharacteristicRef(null);
    setIsTargetDevice(false);
    isRecordingRef.current = false;
    setIsRecording(false);
    setCh3(null);
    setCh4(null);
  };

  const filteredDevices = useMemo(() => {
    if (!searchText.trim()) return devices;

    const lower = searchText.toLowerCase();

    return devices.filter((d) =>
      (d.name || d.localName || "").toLowerCase().includes(lower),
    );
  }, [devices, searchText]);

  const getName = (d: Device) => d.name || d.localName || "";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📶</Text>

        <Text style={styles.title}>Bluetooth Connection</Text>

        <Text style={styles.subtitle}>Scan and connect to BLE devices.</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={scanDevices}>
          <Text style={styles.buttonText}>
            {isScanning ? "Scanning..." : "Scan for Devices"}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.searchInput}
          placeholder="Search device name"
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
        />

        {connectedDevice && (
          <View style={styles.connectionBox}>
            <Text style={styles.connectionTitle}>Connected Device</Text>
            <Text style={styles.connectionName}>
              {getName(connectedDevice)}
            </Text>

            <Text style={styles.connectionMeta}>
              {isTargetDevice ? "Receiving Live Data" : "Generic BLE Device"}
            </Text>

            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnectDevice}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.recordButton}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Text>
            </TouchableOpacity>

            {isRecording && (
              <>
                <Text style={styles.data}>CH3: {ch3 ?? "--"}</Text>
                <Text style={styles.data}>CH4: {ch4 ?? "--"}</Text>
              </>
            )}
          </View>
        )}

        <FlatList
          data={filteredDevices}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceCard}
              onPress={() => connectToDevice(item)}
            >
              <Text style={styles.deviceName}>{getName(item)}</Text>
              <Text style={styles.deviceId}>{item.id}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingHorizontal: 20,
  },
  card: {
    flex: 1,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },
  icon: {
    fontSize: 40,
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: 8,
    color: "#475569",
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  searchInput: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  list: {
    marginTop: 10,
  },
  deviceCard: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  deviceName: {
    fontWeight: "bold",
  },
  deviceId: {
    fontSize: 12,
    color: "#64748b",
  },
  connectionBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#e0f2fe",
    borderRadius: 10,
  },
  connectionTitle: {
    fontWeight: "bold",
  },
  connectionName: {
    marginTop: 4,
  },
  connectionMeta: {
    marginTop: 4,
    fontSize: 12,
  },
  disconnectButton: {
    marginTop: 10,
    backgroundColor: "#dc2626",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  disconnectText: {
    color: "white",
    fontWeight: "600",
  },
  recordButton: {
    marginTop: 10,
    backgroundColor: "#34D399",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  recordButtonText: {
    color: "white",
    fontWeight: "600",
  },
  data: {
    marginTop: 6,
    fontWeight: "bold",
  },
});

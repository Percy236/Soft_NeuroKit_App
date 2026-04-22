import React, { useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type DataFile = {
  id: string;
  name: string;
  date: string;
  sizeKB: number;
};

const initialFiles: DataFile[] = [
  {
    id: "1",
    name: "session_2026_04_08_1530.csv",
    date: "Apr 8, 2026 • 3:30 PM",
    sizeKB: 1820,
  },
  {
    id: "2",
    name: "session_2026_04_07_1015.csv",
    date: "Apr 7, 2026 • 10:15 AM",
    sizeKB: 950,
  },
  {
    id: "3",
    name: "session_2026_04_06_1845.csv",
    date: "Apr 6, 2026 • 6:45 PM",
    sizeKB: 2410,
  },
  {
    id: "4",
    name: "session_2026_04_05_0910.csv",
    date: "Apr 5, 2026 • 9:10 AM",
    sizeKB: 620,
  },
  {
    id: "5",
    name: "session_2026_04_03_1420.csv",
    date: "Apr 3, 2026 • 2:20 PM",
    sizeKB: 1340,
  },
];

type SortOption = "recent" | "oldest" | "largest" | "smallest";

export default function DataScreen() {
  const [files, setFiles] = useState(initialFiles);
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const sortedFiles = useMemo(() => {
    const copied = [...files];

    switch (sortOption) {
      case "recent":
        return copied.sort((a, b) => b.id.localeCompare(a.id));
      case "oldest":
        return copied.sort((a, b) => a.id.localeCompare(b.id));
      case "largest":
        return copied.sort((a, b) => b.sizeKB - a.sizeKB);
      case "smallest":
        return copied.sort((a, b) => a.sizeKB - b.sizeKB);
      default:
        return copied;
    }
  }, [files, sortOption]);

  const deleteFile = (id: string, fileName: string) => {
    Alert.alert(
      "Delete File",
      `Are you sure you want to delete "${fileName}"?\n\nIt will be gone permanently.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setFiles((prev) => prev.filter((file) => file.id !== id));
          },
        },
      ],
    );
  };

  const exportFile = async (fileName: string) => {
    try {
      await Share.share({
        message: `Exporting file: ${fileName}`,
      });
    } catch (error) {
      Alert.alert("Export Failed", "Unable to export this file right now.");
    }
  };

  const renderFile = ({ item }: { item: DataFile }) => (
    <View style={styles.fileHeader}>
      <Text style={styles.fileName}>{item.name}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => exportFile(item.name)}
        >
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteFile(item.id, item.name)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data</Text>
      <Text style={styles.subtitle}>
        Saved session data • {files.length}{" "}
        {files.length === 1 ? "file" : "files"}
      </Text>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === "recent" && styles.activeSort,
          ]}
          onPress={() => setSortOption("recent")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === "recent" && styles.activeSortText,
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === "oldest" && styles.activeSort,
          ]}
          onPress={() => setSortOption("oldest")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === "oldest" && styles.activeSortText,
            ]}
          >
            Oldest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === "largest" && styles.activeSort,
          ]}
          onPress={() => setSortOption("largest")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === "largest" && styles.activeSortText,
            ]}
          >
            Largest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOption === "smallest" && styles.activeSort,
          ]}
          onPress={() => setSortOption("smallest")}
        >
          <Text
            style={[
              styles.sortButtonText,
              sortOption === "smallest" && styles.activeSortText,
            ]}
          >
            Smallest
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedFiles}
        keyExtractor={(item) => item.id}
        renderItem={renderFile}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 15,
    color: "#475569",
    marginTop: 6,
    marginBottom: 20,
  },
  sortContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  sortButton: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  activeSort: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  sortButtonText: {
    color: "#334155",
    fontWeight: "600",
  },
  activeSortText: {
    color: "white",
  },
  listContent: {
    paddingBottom: 30,
  },
  fileCard: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
  },
  fileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
    flex: 1,
    marginRight: 10,
  },
  fileMeta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginLeft: 12,
  },
  exportButton: {
    backgroundColor: "#dbeafe",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  exportButtonText: {
    color: "#1d4ed8",
    fontWeight: "600",
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 12,
  },
});

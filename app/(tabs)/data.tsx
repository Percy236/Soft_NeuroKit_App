import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

type SortOption = "recent" | "oldest" | "largest" | "smallest";
type FileInfo = {
  size: number;
  modificationTime: number;
};

const getDisplayFileName = (fileName: string) =>
  fileName.replace(/_\d{3}(\.csv)$/i, "$1");

export default function DataScreen() {
  const [files, setFiles] = useState<string[]>([]);
  const [fileInfoMap, setFileInfoMap] = useState<Record<string, FileInfo>>({});
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const getFileInfo = useCallback(async (fileName: string) => {
    const fileUri = FileSystem.documentDirectory + fileName;
    const info = await FileSystem.getInfoAsync(fileUri);

    return info;
  }, []);

  const loadFiles = useCallback(async () => {
    try {
      const fileList = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory!,
      );

      const csvFiles = fileList.filter((name) => name.endsWith(".csv"));

      const infoMap = await csvFiles.reduce<Promise<Record<string, FileInfo>>>(
        async (infoMapPromise, name) => {
          const nextInfoMap = await infoMapPromise;
          const info = await getFileInfo(name);

          nextInfoMap[name] =
            info.exists && !info.isDirectory
              ? {
                  size: info.size,
                  modificationTime: info.modificationTime,
                }
              : {
                  size: 0,
                  modificationTime: 0,
                };
          return nextInfoMap;
        },
        Promise.resolve({}),
      );

      csvFiles.sort(
        (a, b) =>
          infoMap[b].modificationTime - infoMap[a].modificationTime,
      );

      setFiles(csvFiles);
      setFileInfoMap(infoMap);
    } catch (error) {
      console.log("Error loading files:", error);
    }
  }, [getFileInfo]);

  useFocusEffect(
    useCallback(() => {
      loadFiles();
    }, [loadFiles]),
  );

  const sortedFiles = useMemo(() => {
    const copied = [...files];

    switch (sortOption) {
      case "recent":
        return copied.sort(
          (a, b) =>
            (fileInfoMap[b]?.modificationTime ?? 0) -
            (fileInfoMap[a]?.modificationTime ?? 0),
        );
      case "oldest":
        return copied.sort(
          (a, b) =>
            (fileInfoMap[a]?.modificationTime ?? 0) -
            (fileInfoMap[b]?.modificationTime ?? 0),
        );
      case "largest":
        return copied.sort(
          (a, b) => (fileInfoMap[b]?.size ?? 0) - (fileInfoMap[a]?.size ?? 0),
        );
      case "smallest":
        return copied.sort(
          (a, b) => (fileInfoMap[a]?.size ?? 0) - (fileInfoMap[b]?.size ?? 0),
        );
      default:
        return copied;
    }
  }, [fileInfoMap, files, sortOption]);

  const deleteFile = (fileName: string) => {
    const displayName = getDisplayFileName(fileName);

    Alert.alert(
      "Delete File",
      `Are you sure you want to delete "${displayName}"?\n\nIt will be gone permanently.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const fileUri = FileSystem.documentDirectory + fileName;

              await FileSystem.deleteAsync(fileUri);

              loadFiles();
            } catch (error) {
              Alert.alert("Delete Failed", "Unable to delete this file.");
              console.log("Error deleting file:", error);
            }
          },
        },
      ],
    );
  };

  const shareFile = async (fileName: string) => {
    const fileUri = FileSystem.documentDirectory + fileName;
    const displayName = getDisplayFileName(fileName);

    try {
      const canShare = await Sharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          "Sharing Not Available",
          "Sharing is not available on this device.",
        );
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        UTI: "public.comma-separated-values-text",
        dialogTitle: `Export ${displayName}`,
      });
    } catch (error) {
      Alert.alert("Export Failed", "Unable to export this file right now.");
      console.log("Error sharing file:", error);
    }
  };

  const renderFile = ({ item }: { item: string }) => {
    const info = fileInfoMap[item];
    const displayName = getDisplayFileName(item);
    const sizeKB = Math.round((info?.size ?? 0) / 1024);
    const modified = info?.modificationTime
      ? new Date(info.modificationTime * 1000).toLocaleString()
      : "--";

    return (
      <View style={styles.fileHeader}>
        <View style={styles.fileDetails}>
          <Text style={styles.fileName}>{displayName}</Text>
          <Text style={styles.fileMeta}>Size: {sizeKB} KB</Text>
          <Text style={styles.fileMeta}>Modified: {modified}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => shareFile(item)}
          >
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteFile(item)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data</Text>
      <Text style={styles.subtitle}>
        Saved session data - {files.length}{" "}
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

      <Text style={styles.sessionCount}>Saved CSV Sessions ({files.length})</Text>

      <FlatList
        data={sortedFiles}
        keyExtractor={(item) => item}
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
  fileDetails: {
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0f172a",
  },
  fileMeta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 6,
  },
  sessionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
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

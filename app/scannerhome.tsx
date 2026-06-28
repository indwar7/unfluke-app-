import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  Share,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import { ChevronRight } from "lucide-react-native";
import axios from "axios";
import { deepCopy } from "../components/UnflukeMain/Utils/common_vars";
import * as Clipboard from "expo-clipboard";
import { Config } from "../helpers/config";
import { useLocalSearchParams } from "expo-router";
import { ScreenWithHeader } from "../components/AppHeader";

const ScannerHomePage = ({ }) => {
  const route = useRoute()
  const { alertsSideBar } = useLocalSearchParams();

  const [alertsScanner, setAS] = useState(route?.params?.alertsScanner)

  const [alerts, setAlerts] = useState(alertsSideBar === "true" ? alertsSideBar : alertsScanner)

  useEffect(() => {
    if (alertsSideBar === "true" || alertsScanner === "true") {
      setAlerts(true);
    } else {
      setAlerts(false);
    }
  }, [alertsSideBar, alertsScanner]);

  console.log("asdfsadf", alerts, alertsSideBar)

  const navigation = useNavigation();
  const auth = useSelector((state) => state.Login);
  const globalState = useSelector((store) => store.Layout);

  const [scanners, setScanners] = useState([]);
  const [filteredScanners, setFilteredScanners] = useState([]);
  const [publicScanners, setPublicScanners] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteScannerId, setDeleteScannerId] = useState(null);
  const [deleteScannerOwner, setDeleteScannerOwner] = useState(null);
  const [subUrl, setSubUrl] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

  const toggleDeleteModal = () => setDeleteModalOpen(!deleteModalOpen);

  const confirmDelete = () => {
    if (!deleteScannerId) return;
    axios
      .post(`${Config.BACKEND_URL}/api/scanner/deleteScanner`, {
        scannerId: deleteScannerId,
      })
      .then((res) => {
        if (res) {
          Alert.alert(
            "Success",
            !alerts ? "Scanner deleted" : "Alert deleted"
          );
          const tmp = deepCopy(scanners);
          const updated = tmp.filter((x) => x._id !== deleteScannerId);
          setScanners(updated);
          setFilteredScanners(updated);
        }
      })
      .catch((err) => {
        console.log(err);
        Alert.alert("Error", "Failed to delete. Please try again.");
      })
      .finally(() => {
        toggleDeleteModal();
        setDeleteScannerId(null);
        setDeleteScannerOwner(null);
      });
  };

  const handleDelete = (scannerId, owner) => {
    setDeleteScannerId(scannerId);
    setDeleteScannerOwner(owner);
    setDeleteModalOpen(true);
  };

  async function handleShare(scannerId) {
    try {
      const scannerState = await axios.post(
        `${Config.BACKEND_URL}/api/scanner/getScannerById`,
        {
          id: scannerId,
        }
      );

      if (scannerState) {
        const res = await axios.post(
          `${Config.BACKEND_URL}/api/scanner/generateSharingUrl`,
          {
            scannerState,
          }
        );

        if (res && res.data?.sharingCode) {
          const type = alerts ? "alert" : "scanner";
          const link = `${Config.PUBLIC_URL}/scanner-sharing?code=${res.data.sharingCode}&alert=false&type=${type}&market=in`;

          await Clipboard.setStringAsync(link);
          Alert.alert("Success", "Link copied to clipboard");
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not copy link");
    }
  }

  const handleEdit = (scanner) => {
    const routeName =
      scanner.scannerType === "technical"
        ? "scanner"
        : scanner.scannerType === "fundamental"
          ? "scanner"
          : "alerts";
    console.log()
    navigation.navigate(routeName, {
      state: scanner,
      type:
        scanner.scannerType === "technical"
          ? "scanner"
          : scanner.scannerType === "fundamental"
            ? "fundamental"
            : "alerts",
    });

  };

  useFocusEffect(
    useCallback(() => {
      if (auth?.user?._id) {
        setLoading(true);
        axios
          .post(`${Config.BACKEND_URL}/api/scanner/getScanners`, {
            id: auth.user._id,
            alerts: alerts ? alerts : false,
          })
          .then((res) => {
            setLoading(false);
            const list = Array.isArray(res) ? res : [];
            setScanners(list);
            setFilteredScanners(list);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      }
    }, [auth, alerts])
  );

  useEffect(() => {
    axios
      .get(`${Config.BACKEND_URL}/api/scanner/getAdminScanners`)
      .then((res) => {
        if (res && Object.keys(res).length > 0) {
          setPublicScanners(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setCurrentPage(1);
    if (text.trim() === "") {
      setFilteredScanners(scanners);
    } else {
      const filtered = scanners.filter((scanner) =>
        scanner.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredScanners(filtered);
    }
  };

  const getTypeLabel = (type) => {
    if (type === "technical") return "Technical";
    if (type === "fundamental") return "Fundamental";
    return "Alert";
  };

  // Pagination
  const totalPages = Math.ceil(filteredScanners.length / itemsPerPage);
  const paginatedData = filteredScanners.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === 1 && styles.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text style={styles.paginationButtonText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            styles.paginationButton,
            currentPage === totalPages && styles.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.paginationButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenWithHeader>
      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={toggleDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this{" "}
              {alerts ? "alert" : "scanner"}?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={toggleDeleteModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>
            {!alerts ? "Scanners" : "Alerts"}
          </Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>Pages / </Text>
            <Text style={styles.breadcrumbText}>
              {!alerts ? " Scanners" : "Alerts"}
            </Text>
          </View>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Home</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() =>
                navigation.navigate(
                  "scanner",
                  {
                    type: alerts === "true" ? "alerts" : "scanner",
                  }
                )
              }
            >
              <Ionicons name="add" size={15} color="white" />
              <Text style={styles.createButtonText}>Create new</Text>
            </TouchableOpacity>
          </View>

          {/* Tab - Single Tab */}
          <View style={styles.tabContainer}>
            <View style={[styles.tab, styles.activeTab]}>
              <Ionicons name="storefront" size={14} color="#2962FF" />
              <Text style={[styles.tabText, styles.activeTabText]}>
                {!alerts ? "Your scanners" : "Your alerts"}
              </Text>
            </View>
          </View>

          {/* Search Box */}
          {!loading && scanners.length > 0 && (
            <View style={styles.searchContainer}>
              <Icon
                name="search"
                size={20}
                color="#787B86"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor="#4C525E"
              />
            </View>
          )}

          {/* Content */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2962FF" />
              <Text style={styles.loadingText}>
                Loading {!alerts ? "scanners" : "alerts"}...
              </Text>
            </View>
          ) : scanners.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {!alerts ? "No scanners found." : "No alerts found."}
              </Text>
            </View>
          ) : (
            <>
              {/* List cards */}
              {paginatedData.map((item, index) => (
                <TouchableOpacity
                  key={item._id || index}
                  style={styles.listCard}
                  onPress={() => handleEdit(item)}
                  activeOpacity={0.75}
                >
                  {/* Avatar */}
                  <View style={styles.listAvatar}>
                    <Text style={styles.listAvatarText}>
                      {(item.name?.[0] || "S").toUpperCase()}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={styles.listInfo}>
                    <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.listMeta}>
                      {getTypeLabel(item.scannerType)}{item.date ? `  ·  ${item.date}` : ""}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.listActions}>
                    <TouchableOpacity
                      onPress={() => handleShare(item._id)}
                      style={styles.actionButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="share-outline" size={18} color="#2962FF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item._id, item.owner)}
                      style={styles.actionButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#F23645" />
                    </TouchableOpacity>
                    <ChevronRight size={16} color="#4C525E" />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </View>
      </ScrollView>
    </ScreenWithHeader>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131722",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#D1D4DC",
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    color: "#787B86",
  },
  card: {
    backgroundColor: "#1E222D",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 40,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D1D4DC",
  },
  createButton: {
    backgroundColor: "#2962FF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  createButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
  },
  tabContainer: {
    backgroundColor: "#2A2E39",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#1E222D",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#787B86",
  },
  activeTabText: {
    color: "#2962FF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#363A45",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#D1D4DC",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#787B86",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#787B86",
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#2A2E39",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerCell: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#787B86",
    textTransform: "uppercase",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
  },
  evenRow: {
    backgroundColor: "#1E222D",
  },
  oddRow: {
    backgroundColor: "#1E222D",
  },
  cellText: {
    fontSize: 13,
    color: "#787B86",
    textAlign: "center",
  },
  linkText: {
    textAlign: "center",
    fontSize: 13,
    color: "#2962FF",
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  // ── List card design (replaces table)
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E222D",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2962FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D1D4DC",
    marginBottom: 3,
  },
  listMeta: {
    fontSize: 12,
    color: "#787B86",
  },
  listActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: { padding: 6 },
  actionButton2: { padding: 6 },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 4,
    gap: 12,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#2962FF",
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#363A45",
  },
  paginationButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  paginationText: {
    fontSize: 14,
    color: "#787B86",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1E222D",
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    maxWidth: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D1D4DC",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    color: "#787B86",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#2A2E39",
  },
  cancelButtonText: {
    color: "#D1D4DC",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#F23645",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ScannerHomePage;
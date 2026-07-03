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
import {
  ChevronRight,
  Search,
  Plus,
  Store,
  Share2,
  Trash2,
  AlertTriangle,
} from "lucide-react-native";
import axios from "axios";
import { deepCopy } from "../components/UnflukeMain/Utils/common_vars";
import * as Clipboard from "expo-clipboard";
import { Config } from "../helpers/config";
import { useLocalSearchParams } from "expo-router";
import { ScreenWithHeader } from "../components/AppHeader";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const ScannerHomePage = ({ }) => {
  const { colors: c, isDark } = useTheme();
  const s = makeStyles(c);

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
          const link = `${Config.PUBLIC_URL}/scanner-sharing?code=${res.data.sharingCode}&alert=false&type=${type}&market=${subUrl || "in"}`;

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
    // Alerts have no dedicated route; scanner.tsx fully handles type==='alerts'.
    const routeName = "scanner";
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
      <View style={s.paginationContainer}>
        <TouchableOpacity
          style={[
            s.paginationButton,
            currentPage === 1 && s.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <Text
            style={[
              s.paginationButtonText,
              currentPage === 1 && s.disabledButtonText,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={s.paginationText}>
          {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[
            s.paginationButton,
            currentPage === totalPages && s.disabledButton,
          ]}
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <Text
            style={[
              s.paginationButtonText,
              currentPage === totalPages && s.disabledButtonText,
            ]}
          >
            Next
          </Text>
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
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalIconWrap}>
              <AlertTriangle size={22} color={c.loss} />
            </View>
            <Text style={s.modalTitle}>Confirm Delete</Text>
            <Text style={s.modalMessage}>
              Are you sure you want to delete this{" "}
              {alerts ? "alert" : "scanner"}?
            </Text>
            <View style={s.modalActions}>
              <TouchableOpacity
                style={[s.modalButton, s.cancelButton]}
                onPress={toggleDeleteModal}
              >
                <Text style={s.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalButton, s.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={s.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={s.scrollView}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.mainTitle}>
            {!alerts ? "Scanners" : "Alerts"}
          </Text>
          <View style={s.breadcrumb}>
            <Text style={s.breadcrumbText}>Pages / </Text>
            <Text style={s.breadcrumbActive}>
              {!alerts ? " Scanners" : "Alerts"}
            </Text>
          </View>
        </View>

        {/* Card Container */}
        <View style={s.card}>
          {/* Card Header */}
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Home</Text>
            <TouchableOpacity
              style={s.createButton}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(
                  "scanner",
                  {
                    type: alerts ? "alerts" : "scanner",
                  }
                )
              }
            >
              <Plus size={15} color={c.onGold} />
              <Text style={s.createButtonText}>Create new</Text>
            </TouchableOpacity>
          </View>

          {/* Tab - Single Tab */}
          <View style={s.tabContainer}>
            <View style={[s.tab, s.activeTab]}>
              <Store size={14} color={c.gold} />
              <Text style={[s.tabText, s.activeTabText]}>
                {!alerts ? "Your scanners" : "Your alerts"}
              </Text>
            </View>
          </View>

          {/* Search Box */}
          {!loading && scanners.length > 0 && (
            <View style={s.searchContainer}>
              <Search
                size={18}
                color={c.textMuted}
                style={s.searchIcon}
              />
              <TextInput
                style={s.searchInput}
                placeholder="Search..."
                value={searchQuery}
                onChangeText={handleSearch}
                placeholderTextColor={c.textMuted}
              />
            </View>
          )}

          {/* Content */}
          {loading ? (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={c.gold} />
              <Text style={s.loadingText}>
                Loading {!alerts ? "scanners" : "alerts"}...
              </Text>
            </View>
          ) : scanners.length === 0 ? (
            <View style={s.emptyContainer}>
              <View style={s.emptyIconWrap}>
                <Store size={26} color={c.gold} />
              </View>
              <Text style={s.emptyText}>
                {!alerts ? "No scanners found." : "No alerts found."}
              </Text>
            </View>
          ) : (
            <>
              {/* List cards */}
              {paginatedData.map((item, index) => (
                <TouchableOpacity
                  key={item._id || index}
                  style={s.listCard}
                  onPress={() => handleEdit(item)}
                  activeOpacity={0.75}
                >
                  {/* Avatar */}
                  <View style={s.listAvatar}>
                    <Text style={s.listAvatarText}>
                      {(item.name?.[0] || "S").toUpperCase()}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={s.listInfo}>
                    <Text style={s.listName} numberOfLines={1}>{item.name}</Text>
                    <Text style={s.listMeta}>
                      {getTypeLabel(item.scannerType)}{item.date ? `  ·  ${item.date}` : ""}
                    </Text>
                  </View>

                  {/* Actions */}
                  <View style={s.listActions}>
                    <TouchableOpacity
                      onPress={() => handleShare(item._id)}
                      style={s.actionButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Share2 size={18} color={c.gold} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(item._id, item.owner)}
                      style={s.actionButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Trash2 size={18} color={c.loss} />
                    </TouchableOpacity>
                    <ChevronRight size={16} color={c.textMuted} />
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

const makeStyles = (c: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  header: {
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: c.text,
    letterSpacing: 0.2,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: "600",
    color: c.textMuted,
  },
  breadcrumbActive: {
    fontSize: 12,
    fontWeight: "700",
    color: c.gold,
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
    marginBottom: 40,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: c.text,
    letterSpacing: 0.2,
  },
  createButton: {
    backgroundColor: c.gold,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    shadowColor: c.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    color: c.onGold,
    fontSize: 13,
    fontWeight: "700",
  },
  tabContainer: {
    backgroundColor: c.surfaceElevated,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: c.border,
  },
  tab: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  activeTab: {
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: c.gold,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: c.textSecondary,
  },
  activeTabText: {
    color: c.gold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.inputBorder,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: c.text,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "500",
    color: c.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: c.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: c.border,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: c.textSecondary,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: c.surfaceElevated,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: "700",
    color: c.textMuted,
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 1.2,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
    alignItems: "center",
  },
  evenRow: {
    backgroundColor: c.card,
  },
  oddRow: {
    backgroundColor: c.card,
  },
  cellText: {
    fontSize: 13,
    color: c.textSecondary,
    textAlign: "center",
  },
  linkText: {
    textAlign: "center",
    fontSize: 13,
    color: c.gold,
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  // ── List card design (replaces table)
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: c.surfaceElevated,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  listAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: c.goldLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: c.gold,
  },
  listAvatarText: {
    color: c.gold,
    fontWeight: "800",
    fontSize: 16,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontWeight: "700",
    color: c.text,
    marginBottom: 3,
  },
  listMeta: {
    fontSize: 12,
    fontWeight: "500",
    color: c.textMuted,
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
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: c.gold,
    borderRadius: 12,
    minWidth: 86,
    alignItems: "center",
    shadowColor: c.gold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: c.surfaceElevated,
    borderWidth: 1,
    borderColor: c.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  paginationButtonText: {
    color: c.onGold,
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButtonText: {
    color: c.textMuted,
  },
  paginationText: {
    fontSize: 14,
    color: c.textSecondary,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: c.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: c.card,
    borderRadius: 20,
    padding: 24,
    minWidth: 300,
    maxWidth: "90%",
    borderWidth: 1,
    borderColor: c.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: c.lossBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: c.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    fontWeight: "500",
    color: c.textSecondary,
    marginBottom: 22,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 84,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: c.surfaceElevated,
    borderWidth: 1,
    borderColor: c.border,
  },
  cancelButtonText: {
    color: c.text,
    fontSize: 14,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: c.loss,
  },
  deleteButtonText: {
    color: c.white,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default ScannerHomePage;

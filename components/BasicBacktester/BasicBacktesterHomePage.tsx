// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Modal,
//   ActivityIndicator,
//   Dimensions,
//   SafeAreaView,
// } from 'react-native';
// import { Switch } from "react-native";
// import { Ionicons } from "@expo/vector-icons";

// import { useNavigation } from '@react-navigation/native';
// import { Alert } from 'react-native';

// const { width } = Dimensions.get('window');
// import BreadCrumb from "../../components/UnflukeMain/Common/BreadCrumb";
// import Loader from "../../components/UnflukeMain/Common/Loader";
// // import TableContainer from "../../components/UnflukeMain/Common/TableContainerReactTable";
// import {
//   deleteStrategies,
//   fetchDefaultStrategies,
//   fetchStrategies,
//   goToBasicStrategyPage,
//   toggleStrategyMonetize,
//   toggleStrategyVisibility,
// } from "../../apis/BasicBacktester";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import { deepCopy } from "../../components/UnflukeMain/Utils/common_vars";
// import LoadingModal from "./LoadingModal";
// import { fetchBasicStrategyDetails } from "../../apis/BasicBacktester";
// import { setEditStrategy } from "../../redux/slices/basicBacktester/reducer";
// import { useDispatch } from "react-redux";
// import { ChevronRight } from "lucide-react-native";

// const BasicBacktesterHomePage = () => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();

//   // State variables
//   const [activeTab, setActiveTab] = useState("1");
//   const auth = useSelector((store) => store.Login);

//   const [strategy, setStrategy] = useState("");
//   const [show, setShow] = useState(false);

//   const [defaultStrategies, setDefaultStrategies] = useState([]);
//   const [userStrategies, setUserStrategies] = useState([]);
//   const [listStrategies, setListStrategies] = useState([]);

//   const [loadingModalOpen, showLoadingModal] = useState(false);
//   const [loadingModalTitle, setLoadingModalTitle] = useState("");
//   const [loadingModalDescription, setLoadingModalDescr] = useState("");

//   const [loading, setLoading] = useState(true);
//   const [subUrl, setSubUrl] = useState("");

//   const globalState = useSelector((store) => store.Layout);

//   // Set subUrl effect
//   useEffect(() => {
//     if (globalState && globalState.appType) {
//       setSubUrl(globalState.appType);
//     }
//   }, [globalState]);

//   // Normalize strategy for store
//   const normalizeStrategyForStore = (raw) => {
//     if (!raw) return raw;
//     const data = raw.data ? raw.data : raw; // axios response vs plain object
//     const legs = data.positions?.legs || [];
//     return {
//       ...data,
//       positions: {
//         ...(data.positions || {}),
//         legs: legs.map((leg, i) => {
//           if (leg._id || leg.id) return leg;
//           return { ...leg, id: `leg_${i}` };
//         }),
//         legSummaries: undefined, // force reducer to rebuild
//       },
//     };
//   };

//   // Handle view result
//   const handleViewResult = async (rowStrategy) => {
//     try {
//       // Always fetch to ensure legs present
//       const full = await fetchBasicStrategyDetails(
//         axios,
//         rowStrategy.user,
//         rowStrategy._id
//       );
//       const strategyObj = normalizeStrategyForStore(full);
//       if (!strategyObj) return;

//       dispatch(setEditStrategy(strategyObj));

//       const fileBase =
//         strategyObj.resultFileName?.split(".")[0] ||
//         rowStrategy.resultFileName?.split(".")[0] ||
//         "";

//       // Navigate to backtester view screen with params
//       navigation.navigate('basic-backtester-view', { filename: fileBase });
//     } catch (e) {
//       console.error("Failed to open strategy for view", e);
//       Alert.alert("Error", "Failed to open strategy for view");
//     }
//   };

//   const handleEdit = async (item) => {

//     try {

//      const stratDetails = await fetchBasicStrategyDetails(axios,item.user, item._id);
//     console.log(stratDetails)

//      if(stratDetails){
//         navigation.navigate(`basic-backtester`, {
//             state: stratDetails
//         })
//     }

//     } catch (error) {
//       console.error("Error editing strategy:", error);
//       Alert.alert("Error", "Failed to edit strategy. Please try again.");
//     }

//   };

//   // Handle private toggle
//   const handlePrivate = async (index, isChecked) => {
//     openLoadingModal("Processing changes...", "");

//     const newFiles = [...listStrategies];
//     const backtestAdmin = newFiles[index].user;
//     const currentUser = auth.user._id;

//     if (backtestAdmin !== currentUser) {
//       closeLoadingModal();
//       Alert.alert("Error", "You don't have permission to modify this strategy");
//       return;
//     }

//     try {
//       newFiles[index].isPrivate = isChecked;
//       await toggleStrategyVisibility(
//         axios,
//         newFiles[index].resultFileName.split(".")[0],
//         false,
//       );
//       setUserStrategies(newFiles);
//       setListStrategies(newFiles);
//       closeLoadingModal();
//     } catch (error) {
//       console.error("Error toggling private status:", error);
//       Alert.alert("Error", "Failed to update privacy settings");
//       closeLoadingModal();
//     }
//   };

//   // Handle monetize toggle
//   const handleMonetize = async (index, isChecked) => {
//     openLoadingModal("Processing changes...", "");

//     const newFiles = [...listStrategies];
//     const backtestAdmin = newFiles[index].user;
//     const currentUser = auth.user._id;

//     if (backtestAdmin !== currentUser) {
//       closeLoadingModal();
//       Alert.alert("Error", "You don't have permission to modify this strategy");
//       return;
//     }

//     try {
//       newFiles[index].monetize = isChecked;
//       await toggleStrategyMonetize(
//         axios,
//         newFiles[index].resultFileName.split(".")[0],
//         false,
//       );

//       if (newFiles[index].monetize) {
//         setStrategy(newFiles[index]);
//         setShow(true);
//       }

//       setUserStrategies(newFiles);
//       setListStrategies(newFiles);
//       closeLoadingModal();
//     } catch (error) {
//       console.error("Error toggling monetize status:", error);
//       Alert.alert("Error", "Failed to update monetization settings");
//       closeLoadingModal();
//     }
//   };

//   // Delete strategy
//   const deleteStrategy = async (fileName, backtestAdmin) => {
//     const currentUser = auth.user._id;

//     if (backtestAdmin !== currentUser) {
//       closeLoadingModal();
//       Alert.alert("Error", "You don't have permission to delete this strategy");
//       return;
//     }

//     try {
//       console.log("delete filename==>", fileName);
//       const res = await deleteStrategies(axios, fileName);

//       if (res) {
//         let tmp = deepCopy(listStrategies);
//         tmp = tmp.filter((e) => e.resultFileName !== fileName + ".csv");
//         setUserStrategies(tmp);
//         setListStrategies(tmp);
//         closeLoadingModal();
//         Alert.alert("Success", "Strategy deleted successfully");
//       }
//     } catch (error) {
//       console.error("Error deleting strategy:", error);
//       Alert.alert("Error", "Failed to delete strategy");
//       closeLoadingModal();
//     }
//   };

//   // Show delete confirmation
//   const showDeleteConfirmation = (fileName, backtestAdmin) => {
//     console.log(fileName, backtestAdmin)
//     Alert.alert(
//       "Delete Strategy",
//       "Are you sure you want to delete this strategy? This action cannot be undone.",
//       [
//         {
//           text: "Cancel",
//           style: "cancel"
//         },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => {
//             openLoadingModal("Deleting your strategy...", "");
//             deleteStrategy(fileName, backtestAdmin);
//           }
//         }
//       ]
//     );
//   };

//   // Open loading modal
//   const openLoadingModal = (title, description) => {
//     setLoadingModalTitle(title);
//     setLoadingModalDescr(description);
//     showLoadingModal(true);
//     return true;
//   };

//   // Close loading modal
//   const closeLoadingModal = () => {
//     setLoadingModalTitle("");
//     setLoadingModalDescr("");
//     showLoadingModal(false);
//   };

//   // Handle clicks (placeholder)
//   const handleClicks = (strategy) => {
//     // Navigate to strategy details or perform action
//     console.log("Strategy clicked:", strategy);
//   };

//   // Toggle tab
//   const toggleTab = (tab, type) => {
//     if (activeTab !== tab) {
//       setActiveTab(tab);
//       let tmp = deepCopy(userStrategies);

//       if (type === "purchased") {
//         tmp = tmp.filter((strat) => strat.monetize === true);
//       }

//       setListStrategies(tmp);
//     }
//   };

//   // Navigate to basic strategy page
//   const navigateToBasicStrategy = (userId, strategyId) => {
//     navigation.navigate('basic-backtester', {
//       userId: userId,
//       strategyId: strategyId
//     });
//   };

//   // Format number for display
//   const formatNumber = (raw) => {
//     const num = typeof raw === "number" ? raw : Number(raw);
//     const intVal = Number.isFinite(num) ? Math.trunc(num) : null;
//     return intVal !== null ? intVal.toLocaleString("en-IN") : "-";
//   };

//   // Get color for number
//   const getNumberColor = (num) => {
//     return num > 0 ? "#16a34a" : num < 0 ? "#dc2626" : "#6b7280";
//   };

//   // Columns configuration for the table
//   const columns = useMemo(
//     () => [
//       {
//         header: "Strategy Name",
//         accessor: "name",
//         flex: 2,
//         cell: (item) => item.name || "-"
//       },
//       {
//         header: "Overall Profit",
//         accessor: "rateOfInterest",
//         flex: 1.5,
//         cell: (item) => {
//           const num = typeof item.rateOfInterest === "number" ? item.rateOfInterest : Number(item.rateOfInterest);
//           return formatNumber(num);
//         }
//       },
//       {
//         header: "Max Draw Down",
//         accessor: "maxDD",
//         flex: 1.5,
//         cell: (item) => {
//           const num = typeof item.maxDD === "number" ? item.maxDD : 0;
//           return formatNumber(num);
//         }
//       },
//       {
//         header: "Created on",
//         accessor: "createdOn",
//         flex: 1.5,
//         cell: (item) => item.createdOn || "-"
//       },
//       {
//         header: "Private",
//         accessor: "isPrivate",
//         flex: 1,
//         cell: (item) => item.isPrivate ? "Yes" : "No"
//       },
//       {
//         header: "Monetize",
//         accessor: "monetize",
//         flex: 1,
//         cell: (item) => item.monetize ? "Yes" : "No"
//       },
//       {
//         header: "Selling Price",
//         accessor: "sellPrice",
//         flex: 1,
//         cell: (item) => (item.sellPrice && item.monetize) ? item.sellPrice : "-"
//       }
//     ],
//     []
//   );

//   // Default columns (for purchased strategies)
//   const columns_default = useMemo(
//     () => [
//       {
//         header: "Strategy Name",
//         accessor: "name",
//         flex: 2,
//         cell: (item) => item.name || "-"
//       },
//       {
//         header: "ROI",
//         accessor: "rateOfInterest",
//         flex: 1,
//         cell: (item) => formatNumber(item.rateOfInterest)
//       }
//     ],
//     []
//   );

//   // Fetch all strategies effect
//   useEffect(() => {
//     const fetchAllStrategy = async () => {
//       const ID = auth.user._id;
//       if (ID) {
//         try {
//           setLoading(true);
//           const allStrategies = await fetchStrategies(axios, { ID: ID });

//           if (allStrategies) {
//             setUserStrategies(allStrategies);
//             setListStrategies(allStrategies);
//           }
//         } catch (error) {
//           console.error("Error fetching strategies:", error);
//           Alert.alert("Error", "Failed to fetch strategies");
//         } finally {
//           setLoading(false);
//         }
//       }
//     };

//     fetchAllStrategy();
//   }, [auth]);

//   const LoadingModal = () => (
//     <Modal
//       visible={loadingModalOpen}
//       transparent={true}
//       animationType="fade"
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <ActivityIndicator size="large" color="#08a88a" />
//           <Text style={styles.modalTitle}>{loadingModalTitle}</Text>
//           <Text style={styles.modalDescription}>{loadingModalDescription}</Text>
//         </View>
//       </View>
//     </Modal>
//   );

//   const TabButton = ({ title, tabId, filterType, isActive, onPress }) => (
//     <TouchableOpacity
//       style={[
//         styles.tabButton,
//         isActive ? styles.activeTabButton : styles.inactiveTabButton
//       ]}
//       onPress={() => onPress(tabId, filterType)}
//     >
//       <Text style={[
//         styles.tabText,
//         isActive ? styles.activeTabText : styles.inactiveTabText
//       ]}>
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );

// // Strategy Table Component
// const StrategyTable = ({ strategies }) => {
//   return (
//     <View style={styles.tableContainer}>
//       {/* Header Row */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.tableScrollContent}
//       >
//         <View style={styles.tableWrapper}>
//           {/* Header */}
//           <View style={[styles.tableRow, styles.tableHeader]}>
//             <Text style={[styles.tableCell, styles.headerText, styles.strategyNameCell]}>Strategy Name</Text>
//             <Text style={[styles.tableCell, styles.headerText, styles.numberCell]}>Overall Profit</Text>
//             <Text style={[styles.tableCell, styles.headerText, styles.numberCell]}>Max Draw Down</Text>
//             <Text style={[styles.tableCell, styles.headerText, styles.dateCell]}>Created On</Text>
//             <Text style={[styles.tableCell, styles.headerText, styles.switchCell]}>Private</Text>
//             <Text style={[styles.tableCell, styles.headerText, styles.switchCell]}>Monetize</Text>
//             <Text style={[styles.tableCell, styles.headerText, styles.priceCell]}>Selling Price</Text>
//             <Text style={[styles.tableCell, styles.headerText, styles.actionCell]}>Action</Text>
//           </View>

//           {/* Data Rows */}
//           {strategies.map((item, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.tableRow2,
//                 index % 2 === 0 ? styles.evenRow : styles.oddRow,
//               ]}
//             >
//               <Text style={[styles.tableCell, styles.strategyNameCell]}>{item.name}</Text>
//               <Text style={[styles.tableCell, styles.numberCell, { color: item.rateOfInterest > 0 ? "green" : "red" }]}>
//                 {formatNumber(item.rateOfInterest)}
//               </Text>
//               <Text style={[styles.tableCell, styles.numberCell, { color: "red" }]}>
//                 {formatNumber(item.maxDD)}
//               </Text>
//               <Text style={[styles.tableCell, styles.dateCell]}>{item.createdOn}</Text>

//               {/* Private Switch */}
//               <View style={[styles.tableCell, styles.switchCell]}>
//                 <Switch
//                   value={item.isPrivate}
//                   onValueChange={(val) => handlePrivate(index, val)}
//                 />
//               </View>

//               {/* Monetize Switch */}
//               <View style={[styles.tableCell, styles.switchCell]}>
//                 <Switch
//                   value={item.monetize}
//                   onValueChange={(val) => handleMonetize(index, val)}
//                 />
//               </View>

//               <Text style={[styles.tableCell, styles.priceCell]}>
//                 {item.sellPrice && item.monetize ? item.sellPrice : "-"}
//               </Text>

//               {/* Actions */}
//               <View style={[styles.tableCell, styles.actionCell]}>
//                 <TouchableOpacity onPress={() => handleEdit(item)}>
//                   <Ionicons name="pencil" size={18} color="#3b82f6" />
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => handleViewResult(item)}>
//                   <Ionicons name="eye" size={18} color="#16a34a" />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => showDeleteConfirmation(item.resultFileName.split(".")[0], item.user)}
//                 >
//                   <Ionicons name="trash" size={18} color="#dc2626" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

//   const EmptyState = ({ message }) => (
//     <View style={styles.emptyContainer}>
//       <Text style={styles.emptyText}>{message}</Text>
//     </View>
//   );

//   const LoadingState = () => (
//     <View style={styles.loadingContainer}>
//       <ActivityIndicator size="large" color="#3b82f6" />
//       <Text style={styles.loadingText}>Loading strategies...</Text>
//     </View>
//   );
// console.log("columns", columns)
// console.log("strats", listStrategies)
//   return (
//     <SafeAreaView style={styles.container}>
//       <LoadingModal />
//       <View style={styles.headerContainer} >
//                           <Text style={styles.title}>Backtester Home</Text>
//                           <View style={styles.breadcrumb}>
//                             <Text style={styles.breadcrumbText}>Pages</Text>
//                             <ChevronRight size={13} color="#6B7280" />
//                             <Text style={styles.breadcrumbText}>Basic Backtester</Text>
//                           </View>
//                         </View>
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {/* Header */}

//         {/* Main Card */}
//         <View style={styles.card}>
//           {/* Card Header */}
//           <View style={styles.cardHeaderSection}>
//             <Text style={styles.cardTitle}>Your saved strategies</Text>
//             <TouchableOpacity
//               style={styles.createButton}
//               onPress={() => navigation.navigate(`basic-backtester`)}
//             >
//               <Ionicons name="add" size={15} color="white" />
//               <Text style={styles.createButtonText}>Create new</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Tab Container */}
//           <View style={styles.tabContainer}>
//             <TabButton
//               title="Your strategies"
//               tabId="1"
//               filterType="all"
//               isActive={activeTab === "1"}
//               onPress={toggleTab}
//             />
//             <TabButton
//               title="Purchased strategies"
//               tabId="2"
//               filterType="purchased"
//               isActive={activeTab === "2"}
//               onPress={toggleTab}
//             />
//           </View>

//           {/* Content */}
//           <View style={styles.content}>
//             {!loading ? (
//               <>
//                 {listStrategies.length > 0 ? (
//                   <StrategyTable strategies={[...(listStrategies || [])].reverse()} />

//                 ) : (
//                   <EmptyState message="No strategies found." />
//                 )}
//               </>
//             ) : (
//               <LoadingState />
//             )}
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({

//   tableContainer: {
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     borderRadius: 8,
//     overflow: "hidden",
//   },
//   tableScrollContent: {
//     minWidth: '100%',
//   },
//   tableWrapper: {
//     minWidth: 800, // Adjust based on your content
//   },
//   tableRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//     tableRow2: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 4,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//   },
//   tableHeader: {
//     backgroundColor: "#f5f7fa",
//   },
//   evenRow: {
//     backgroundColor: "#fff",
//   },
//   oddRow: {
//     backgroundColor: "#f9fafb",
//   },
//   tableCell: {
//     textAlign: "center",
//     fontSize: 13,
//     color: "#374151",
//     paddingHorizontal: 5,
//   },
//   headerText: {
//     fontWeight: "600",
//     fontSize: 12,
//     textTransform: "uppercase",
//     color: "#374151",
//   },

//   // Specific cell width styles
//   strategyNameCell: {
//     width: 150,
//     flex: 0,
//   },
//   numberCell: {
//     width: 100,
//     flex: 0,
//   },
//   dateCell: {
//     width: 120,
//     flex: 0,
//   },
//   switchCell: {
//     width: 80,
//     flex: 0,
//   },
//   priceCell: {
//     width: 100,
//     flex: 0,
//   },
//   actionCell: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     width: 120,
//     flex: 0,
//   },

//   container: {
//     flex: 1,
//     backgroundColor: '#f8fafc',
//     paddingTop:109,
//     paddingHorizontal:12,
//   },
//   scrollView: {
//     flex: 1,
//     padding:1,
//   },
//   headerContainer: {
//     paddingBottom: 16,
//   },
//   title: {
//     fontSize: 17,
//     fontWeight: "bold",
//     color: "#111827",
//   },
//   breadcrumb: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },
//   breadcrumbText: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 3,
//     marginBottom:16
//   },
//   cardHeaderSection: {
//     paddingHorizontal: 15,
//     paddingVertical:13,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   cardTitle: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   createButton: {
//     backgroundColor: '#3b82f6',
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     borderRadius: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 3,
//   },
//   createButtonText: {
//     color: 'white',
//     fontSize: 13,
//     fontWeight: '500',
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#f3f4f6',
//     margin: 20,
//     marginBottom: 0,
//     borderRadius: 6,
//     padding: 4,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 3,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     alignItems: 'center',
//     justifyContent:"center"
//   },
//   activeTabButton: {
//     backgroundColor: 'white',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   inactiveTabButton: {
//     backgroundColor: 'transparent',
//   },
//   tabText: {
//     fontSize: 13,
//     fontWeight: '600',
//     textAlign:"center"
//   },
//   activeTabText: {
//     color: '#111827',
//   },
//   inactiveTabText: {
//     color: '#64748b',
//   },
//   content: {
//     padding: 20,
//   },
//   strategiesList: {
//     gap: 12,
//   },

//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#f9fafb',
//     borderRadius: 6,
//     marginBottom: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: '#374151',
//   },
//   table: {
//     borderRadius: 8,
//     overflow: 'hidden',
//   },

//   headerCell: {
//     paddingHorizontal: 8,
//     justifyContent: 'center',
//   },

//   tableBody: {
//     maxHeight: 400,
//   },

//   cellText: {
//     fontSize: 14,
//     color: '#374151',
//   },
//   resultsText: {
//     fontSize: 12,
//     color: '#6b7280',
//     textAlign: 'center',
//     paddingVertical: 8,
//   },
//   strategyCard: {
//     backgroundColor: '#f9fafb',
//     borderRadius: 8,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   strategyName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     flex: 1,
//   },
//   strategyDate: {
//     fontSize: 12,
//     color: '#6b7280',
//   },
//   cardBody: {
//     gap: 8,
//   },
//   strategyDescription: {
//     fontSize: 14,
//     color: '#374151',
//     lineHeight: 20,
//   },
//   strategyMeta: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   metaText: {
//     fontSize: 12,
//     color: '#6b7280',
//   },
//   emptyContainer: {
//     paddingVertical: 40,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#6b7280',
//   },
//   loadingContainer: {
//     paddingVertical: 40,
//     alignItems: 'center',
//     gap: 12,
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#6b7280',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 30,
//     borderRadius: 12,
//     alignItems: 'center',
//     minWidth: 250,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#111827',
//     marginTop: 16,
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   modalDescription: {
//     fontSize: 14,
//     color: '#6b7280',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });

// export default BasicBacktesterHomePage;

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   TextInput,
//   Modal,
//   Switch,
//   Alert,
// } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { useSelector, useDispatch } from "react-redux";
// import Icon from "react-native-vector-icons/Ionicons";
// import axios from "axios";
// import {
//   deleteStrategies,
//   fetchStrategies,
//   goToBasicStrategyPage,
//   toggleStrategyMonetize,
//   toggleStrategyVisibility,
//   fetchBasicStrategyDetails,
// } from "../../apis/BasicBacktester";
// import { setEditStrategy } from "../../redux/slices/basicBacktester/reducer";
// import { deepCopy } from "../../components/UnflukeMain/Utils/common_vars";
// import { Ionicons } from "@expo/vector-icons";
// import { ChevronRight } from "lucide-react-native";

// const BasicBacktesterHomePage = () => {
//   const dispatch = useDispatch();
//   const navigation = useNavigation();
//   const auth = useSelector((store) => store.Login);
//   const globalState = useSelector((store) => store.Layout);

//   const [activeTab, setActiveTab] = useState("1");
//   const [strategy, setStrategy] = useState("");
//   const [userStrategies, setUserStrategies] = useState([]);
//   const [listStrategies, setListStrategies] = useState([]);
//   const [filteredStrategies, setFilteredStrategies] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [loadingModalOpen, showLoadingModal] = useState(false);
//   const [loadingModalTitle, setLoadingModalTitle] = useState("");
//   const [subUrl, setSubUrl] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;

//   useEffect(() => {
//     if (globalState && globalState.appType) {
//       setSubUrl(globalState.appType);
//     }
//   }, [globalState]);

//   const normalizeStrategyForStore = (raw) => {
//     if (!raw) return raw;
//     const data = raw.data ? raw.data : raw;
//     const legs = data.positions?.legs || [];
//     return {
//       ...data,
//       positions: {
//         ...(data.positions || {}),
//         legs: legs.map((leg, i) => {
//           if (leg._id || leg.id) return leg;
//           return { ...leg, id: `leg_${i}` };
//         }),
//         legSummaries: undefined,
//       },
//     };
//   };

//   const handleViewResult = async (rowStrategy) => {
//     try {
//       const full = await fetchBasicStrategyDetails(
//         axios,
//         rowStrategy.user,
//         rowStrategy._id
//       );
//       const strategyObj = normalizeStrategyForStore(full);
//       if (!strategyObj) return;
//       dispatch(setEditStrategy(strategyObj));
//       const fileBase =
//         strategyObj.resultFileName?.split(".")[0] ||
//         rowStrategy.resultFileName?.split(".")[0] ||
//         "";
//       navigation.navigate("basic-backtester-view", { filename: fileBase });
//     } catch (e) {
//       console.error("Failed to open strategy for view", e);
//       Alert.alert("Error", "Failed to load strategy details");
//     }
//   };


//   const handleEdit = async (item) => {

//     try {

//      const stratDetails = await fetchBasicStrategyDetails(axios,item.user, item._id);
//     console.log("Strategy Details",stratDetails)

//      if(stratDetails){
//         navigation.navigate(`basic-backtester`, {
//             state: stratDetails
//         })
//     }


//     } catch (error) {
//       console.error("Error editing strategy:", error);
//       Alert.alert("Error", "Failed to edit strategy. Please try again.");
//     }

//   };

//   const handlePrivate = async (index, checked) => {
//     openLoadingModal("Processing changes...");

//     const newFiles = [...listStrategies];
//     const backtestAdmin = newFiles[index].user;
//     const currentUser = auth.user._id;

//     if (backtestAdmin !== currentUser) {
//       closeLoadingModal();
//       return;
//     }

//     newFiles[index].isPrivate = checked;
//     await toggleStrategyVisibility(
//       axios,
//       newFiles[index].resultFileName.split(".")[0],
//       false
//     );
//     setUserStrategies(newFiles);
//     closeLoadingModal();
//   };

//   const handleMonetize = async (index, checked) => {
//     openLoadingModal("Processing changes...");

//     const newFiles = [...listStrategies];
//     const backtestAdmin = newFiles[index].user;
//     const currentUser = auth.user._id;

//     if (backtestAdmin !== currentUser) {
//       closeLoadingModal();
//       return;
//     }

//     newFiles[index].monetize = checked;
//     await toggleStrategyMonetize(
//       axios,
//       newFiles[index].resultFileName.split(".")[0],
//       false
//     );
//     setUserStrategies(newFiles);
//     closeLoadingModal();
//   };

//   const deleteStrategy = async (fileName, backtestAdmin) => {
//     const currentUser = auth.user._id;

//     if (backtestAdmin !== currentUser) {
//       closeLoadingModal();
//       return;
//     }

//     const res = await deleteStrategies(axios, fileName);

//     if (res) {
//       let tmp = deepCopy(listStrategies);
//       tmp = tmp.filter((e) => e.resultFileName !== fileName + ".csv");
//       setUserStrategies(tmp);
//       closeLoadingModal();
//       Alert.alert("Success", "Strategy deleted");
//     }
//   };

//   const confirmDelete = (fileName, backtestAdmin) => {
//     Alert.alert(
//       "Delete Strategy",
//       "Are you sure you want to delete this strategy?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: () => {
//             openLoadingModal("Deleting your strategy...");
//             deleteStrategy(fileName, backtestAdmin);
//           },
//         },
//       ]
//     );
//   };

//   const openLoadingModal = (title) => {
//     setLoadingModalTitle(title);
//     showLoadingModal(true);
//   };

//   const closeLoadingModal = () => {
//     setLoadingModalTitle("");
//     showLoadingModal(false);
//   };

//   const toggleTab = (tab, type) => {
//     if (activeTab !== tab) {
//       setActiveTab(tab);
//       setCurrentPage(1);
//       let tmp = deepCopy(userStrategies);

//       if (type === "purchased") {
//         tmp = tmp.filter((strat) => strat.monetize === true);
//       }

//       setListStrategies(tmp);
//       setFilteredStrategies(tmp);
//     }
//   };

//   const handleSearch = (text) => {
//     setSearchQuery(text);
//     setCurrentPage(1);
//     if (text.trim() === "") {
//       setFilteredStrategies(listStrategies);
//     } else {
//       const filtered = listStrategies.filter((strategy) =>
//         strategy.name.toLowerCase().includes(text.toLowerCase())
//       );
//       setFilteredStrategies(filtered);
//     }
//   };

//   useEffect(() => {
//     const fetchAllStrategy = async () => {
//       const ID = auth.user._id;
//       if (ID) {
//         const allStrategies = await fetchStrategies(axios, { ID: ID });

//         if (allStrategies) {
//           const reversed = [...allStrategies].reverse();
//           setUserStrategies(reversed);
//           setListStrategies(reversed);
//           setFilteredStrategies(reversed);
//           setLoading(false);
//         }
//       }
//     };

//     fetchAllStrategy();
//   }, [auth]);

//   const formatNumber = (num) => {
//     if (num === null || num === undefined) return "-";
//     const number = typeof num === "number" ? num : Number(num);
//     if (!Number.isFinite(number)) return "-";
//     return Math.trunc(number).toLocaleString("en-IN");
//   };

//   const getColorForValue = (value) => {
//     if (value > 0) return "#16a34a";
//     if (value < 0) return "#dc2626";
//     return "#6b7280";
//   };

//   // Pagination
//   const totalPages = Math.ceil(filteredStrategies.length / itemsPerPage);
//   const paginatedData = filteredStrategies.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   const renderPagination = () => {
//     if (totalPages <= 1) return null;

//     return (
//       <View style={styles.paginationContainer}>
//         <TouchableOpacity
//           style={[
//             styles.paginationButton,
//             currentPage === 1 && styles.disabledButton,
//           ]}
//           onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
//           disabled={currentPage === 1}
//         >
//           <Text style={styles.paginationButtonText}>Previous</Text>
//         </TouchableOpacity>

//         <Text style={styles.paginationText}>
//         {currentPage} of {totalPages}
//         </Text>

//         <TouchableOpacity
//           style={[
//             styles.paginationButton,
//             currentPage === totalPages && styles.disabledButton,
//           ]}
//           onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//           disabled={currentPage === totalPages}
//         >
//           <Text style={styles.paginationButtonText}>Next</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {/* Loading Modal */}
//       <Modal visible={loadingModalOpen} transparent animationType="fade">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <ActivityIndicator size="large" color="#3b82f6" />
//             <Text style={styles.modalTitle}>{loadingModalTitle}</Text>
//           </View>
//         </View>
//       </Modal>

//       <ScrollView style={styles.scrollView}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.mainTitle}>Backtester Home</Text>
//           <View style={styles.breadcrumb}>
//             <Text style={styles.breadcrumbText}>Pages</Text>
//             <ChevronRight size={13} color="#6B7280" />
//             <Text style={styles.breadcrumbText}>Basic Backtester</Text>
//           </View>
//         </View>

//         {/* Card Container */}
//         <View style={styles.card}>
//           {/* Card Header */}
//           <View style={styles.cardHeader}>
//             <Text style={styles.cardTitle}>Your saved strategies</Text>
//             <TouchableOpacity
//               style={styles.createButton}
//               onPress={() => navigation.navigate(`basic-backtester`)}
//             >
//               <Ionicons name="add" size={15} color="white" />
//               <Text style={styles.createButtonText}>Create new</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Tabs */}
//           <View style={styles.tabContainer}>
//             <TouchableOpacity
//               style={[styles.tab, activeTab === "1" && styles.activeTab]}
//               onPress={() => toggleTab("1", "all")}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeTab === "1" && styles.activeTabText,
//                 ]}
//               >
//                 Your strategies
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.tab, activeTab === "2" && styles.activeTab]}
//               onPress={() => toggleTab("2", "purchased")}
//             >
//               <Text
//                 style={[
//                   styles.tabText,
//                   activeTab === "2" && styles.activeTabText,
//                 ]}
//               >
//                 Purchased strategies
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {/* Search Box */}
//           {!loading && listStrategies.length > 0 && (
//             <View style={styles.searchContainer}>
//               <Icon
//                 name="search"
//                 size={20}
//                 color="#6b7280"
//                 style={styles.searchIcon}
//               />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholder="Search for strategies..."
//                 value={searchQuery}
//                 onChangeText={handleSearch}
//                 placeholderTextColor="#9ca3af"
//               />
//             </View>
//           )}

//           {/* Content */}
//           {loading ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#3b82f6" />
//               <Text style={styles.loadingText}>Loading strategies...</Text>
//             </View>
//           ) : listStrategies.length === 0 ? (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>No strategies found.</Text>
//             </View>
//           ) : (
//             <>
//               {/* Table */}
//               <ScrollView horizontal showsHorizontalScrollIndicator={true}>
//                 <View style={styles.tableContainer}>
//                   {/* Table Header */}
//                   <View style={styles.tableHeader}>
//                     <Text style={[styles.headerCell, { width: 150 }]}>
//                       Strategy Name
//                     </Text>
//                     <Text style={[styles.headerCell, { width: 120 }]}>
//                       Overall Profit
//                     </Text>
//                     <Text style={[styles.headerCell, { width: 120 }]}>
//                       Max Draw Down
//                     </Text>
//                     <Text style={[styles.headerCell, { width: 120 }]}>
//                       Created on
//                     </Text>
//                     <Text style={[styles.headerCell, { width: 80 }]}>
//                       Private
//                     </Text>
//                     <Text style={[styles.headerCell, { width: 80 }]}>
//                       Monetize
//                     </Text>
//                     <Text style={[styles.headerCell, { width: 100 }]}>
//                       Selling Price
//                     </Text>
//                     <Text style={[styles.headerCell, { width: 120 }]}>
//                       Actions
//                     </Text>
//                   </View>

//                   {/* Table Body */}
//                   {paginatedData.map((item, index) => (
//                     <View
//                       key={index}
//                       style={[
//                         styles.tableRow,
//                         index % 2 === 0 ? styles.evenRow : styles.oddRow,
//                       ]}
//                     >
//                       {/* Strategy Name */}
//                       <TouchableOpacity
//                         style={{ width: 150 }}
//                                                  onPress={() => handleEdit(item)}

//                       >
//                         <Text style={styles.linkText} numberOfLines={2}>
//                           {item.name}
//                         </Text>
//                       </TouchableOpacity>

//                       {/* Overall Profit */}
//                       <Text
//                         style={[
//                           styles.cellText,
//                           {
//                             width: 120,
//                             color: getColorForValue(item.rateOfInterest),
//                           },
//                         ]}
//                       >
//                         {formatNumber(item.rateOfInterest)}
//                       </Text>

//                       {/* Max Draw Down */}
//                       <Text
//                         style={[
//                           styles.cellText,
//                           { width: 120, color: getColorForValue(item.maxDD) },
//                         ]}
//                       >
//                         {formatNumber(item.maxDD)}
//                       </Text>

//                       {/* Created on */}
//                       <Text style={[styles.cellText, { width: 120 }]}>
//                         {item.createdOn || "-"}
//                       </Text>

//                       {/* Private Switch */}
//                       <View style={[styles.switchCell, { width: 80 }]}>
//                         <Switch
//                           value={item.isPrivate}
//                           onValueChange={(value) => handlePrivate(index, value)}
//                           trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
//                           thumbColor="#fff"
//                         />
//                       </View>

//                       {/* Monetize Switch */}
//                       <View style={[styles.switchCell, { width: 80 }]}>
//                         <Switch
//                           value={item.monetize}
//                           onValueChange={(value) =>
//                             handleMonetize(index, value)
//                           }
//                           disabled={item.isPrivate}
//                           trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
//                           thumbColor="#fff"
//                         />
//                       </View>

//                       {/* Selling Price */}
//                       <Text style={[styles.cellText, { width: 100 }]}>
//                         {item.sellPrice && item.monetize ? item.sellPrice : "-"}
//                       </Text>

//                       {/* Actions */}
//                       <View style={[styles.actionsCell, { width: 120 }]}>
//                         <TouchableOpacity
//                           onPress={() => handleEdit(item)}
//                         >
//                           <Ionicons name="pencil" size={18} color="#3b82f6" />
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() => handleViewResult(item)}
//                         >
//                           <Ionicons name="eye" size={18} color="#16a34a" />
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                           onPress={() =>
//                             confirmDelete(
//                               item.resultFileName.split(".")[0],
//                               item.user
//                             )
//                           }
//                         >
//                           <Ionicons name="trash" size={18} color="#dc2626" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               </ScrollView>

//               {/* Pagination */}
//               {renderPagination()}
//             </>
//           )}
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//     paddingTop: 60,
//   },
//   scrollView: {
//     flex: 1,
//     paddingHorizontal: 12,
//     paddingTop: 24,
//   },
//   header: {
//     marginBottom: 16,
//   },
//   mainTitle: {
//     fontSize: 17,
//     fontWeight: "bold",
//     color: "#111827",
//   },
//   breadcrumb: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },
//   breadcrumbText: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//     marginBottom: 40,
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#111827",
//   },
//   createButton: {
//     backgroundColor: "#3b82f6",
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     borderRadius: 6,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//   },
//   createButtonText: {
//     color: "white",
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   tabContainer: {
//     flexDirection: "row",
//     backgroundColor: "#f3f4f6",
//     borderRadius: 8,
//     padding: 4,
//     marginBottom: 16,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 6,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   activeTab: {
//     backgroundColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//     alignItems: "center",
//   },
//   tabText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#64748b",
//     alignItems: "center",
//   },
//   activeTabText: {
//     color: "#111827",
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f9fafb",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     paddingHorizontal: 12,
//     marginBottom: 16,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 10,
//     fontSize: 14,
//     color: "#111827",
//   },
//   loadingContainer: {
//     paddingVertical: 40,
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   emptyContainer: {
//     paddingVertical: 40,
//     alignItems: "center",
//   },
//   emptyText: {
//     fontSize: 14,
//     color: "#6b7280",
//   },
//   tableContainer: {
//     borderWidth: 1,
//     borderColor: "#e5e7eb",
//     borderRadius: 8,
//     overflow: "hidden",
//   },
//   tableHeader: {
//     flexDirection: "row",
//     backgroundColor: "#f5f7fa",
//     paddingVertical: 12,
//     paddingHorizontal: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//   },
//   headerCell: {
//     fontSize: 11,
//     fontWeight: "bold",
//     color: "#6b7280",
//     textTransform: "uppercase",
//     textAlign: "center",
//   },
//   tableRow: {
//     flexDirection: "row",
//     paddingHorizontal: 6,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     alignItems: "center",
//   },
//   evenRow: {
//     backgroundColor: "#fff",
//   },
//   oddRow: {
//     backgroundColor: "#f9fafb",
//   },
//   cellText: {
//     fontSize: 13,
//     color: "#374151",
//     textAlign: "center",
//   },
//   linkText: {
//     textAlign: "center",
//     fontSize: 13,
//     color: "#3b82f6",
//     fontWeight: "600",
//   },
//   switchCell: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   actionsCell: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//   },
//   paginationContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingTop: 20,
//     paddingBottom:4,
//     gap: 12,
//   },
//   paginationButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: "#3b82f6",
//     borderRadius: 6,
//     minWidth: 80,
//     alignItems: "center",
//   },
//   disabledButton: {
//     backgroundColor: "#d1d5db",
//   },
//   paginationButtonText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   paginationText: {
//     fontSize: 14,
//     color: "#374151",
//     fontWeight: "500",
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalContent: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 24,
//     alignItems: "center",
//     minWidth: 200,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111827",
//     marginTop: 12,
//   },
// });

// export default BasicBacktesterHomePage;

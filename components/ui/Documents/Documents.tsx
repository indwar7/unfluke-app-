// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   TouchableOpacity,
//   Linking,
//   Platform,
//   SafeAreaView,
//   ScrollView,
// } from 'react-native';
// import { WebView } from 'react-native-webview';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// // import DocumentPicker from 'react-native-document-picker';
// // import FileViewer from 'react-native-file-viewer';
// import { getCompanyCode, getDocumentsData } from '../../../constants/Unfluke_helpers/backend_helper';

// const Documents = ({ companyName }) => {
//   const [loading, setLoading] = useState(true);
//   const [companyCode, setCompanyCode] = useState(null);
//   const [ASCR, setASCR] = useState([]);
//   const [CreditRating, setCreditRating] = useState([]);
//   const [AnnualReport, setAnnualReport] = useState([]);
//   const [Announcements, setAnnouncements] = useState([]);
//   const [ConferenceCall, setConferenceCall] = useState([]);
//   const [viewingFile, setViewingFile] = useState(null);
//   const lastFetchedCompanyName = useRef(null);

//   useEffect(() => {
//     if (lastFetchedCompanyName.current === companyName) return;

//     async function getData() {
//       setLoading(true);
//       try {
//         const result = await getCompanyCode({
//           params: { instrument: companyName },
//         });

//         if (result?.code) {
//           const response = await getDocumentsData({
//             params: { instrument: result.code },
//           });

//           setASCR(response.ASCR || []);
//           setAnnualReport(response.AnnualReport || []);
//           setAnnouncements(response.Announcement || []);
//           setConferenceCall(response.ConferenceCalls || []);
//           setCreditRating(response.CreditRating || []);
//           setCompanyCode(result.code);
//         } else {
//           setASCR([]);
//           setAnnouncements([]);
//           setAnnualReport([]);
//           setConferenceCall([]);
//           setCreditRating([]);
//         }
//       } catch (error) {
//         console.error('Error fetching company code:', error);
//         setASCR([]);
//         setAnnouncements([]);
//         setAnnualReport([]);
//         setConferenceCall([]);
//         setCreditRating([]);
//       } finally {
//         setLoading(false);
//         lastFetchedCompanyName.current = companyName;
//       }
//     }

//     getData();
//   }, [companyName]);

//   const handleOpenFile = async (url) => {
//     try {
//       // First try to open directly with FileViewer
//       const fileUri = url; // This should be a local file path for FileViewer
      
//       // For remote files, you might need to download first
//       // Here's a simplified approach that just opens in browser or WebView
//       if (url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i)) {
//         setViewingFile(url);
//       } else {
//         await Linking.openURL(url);
//       }
//     } catch (error) {
//       console.error('Error opening file:', error);
//       // Fallback to opening in browser
//       await Linking.openURL(url);
//     }
//   };

//   const renderDocumentItem = ({ item, type }) => {
//     let title, subtitle, icon;
    
//     switch (type) {
//       case 'annual':
//         title = `Financial Year ${item.Year}`;
//         subtitle = '';
//         icon = 'description';
//         break;
//       case 'credit':
//         title = item.Agency || 'Credit Rating';
//         subtitle = item.Date?.split('from')[0]?.trim() || 'No date provided';
//         icon = 'star';
//         break;
//       case 'conference':
//         title = 'Investor Meet - Outcome';
//         subtitle = item['Date/Month-Year'] || 'No date provided';
//         icon = 'call';
//         break;
//       default:
//         title = item.title || 'Document';
//         subtitle = item.date || '';
//         icon = 'insert-drive-file';
//     }

//     return (
//       <TouchableOpacity 
//         style={styles.documentCard}
//         onPress={() => handleOpenFile(type === 'annual' ? item.Download_link : item.URL || item['Credit Rating URL'])}
//       >
//         <View style={styles.documentHeader}>
//             <View style={styles.documentHeadertitle}>
//                 <Icon name={icon} size={15} color="#3b82f6" style={styles.documentIcon} />
//           <Text style={styles.documentTitle}>{title}</Text>
//             </View>         
//           <Text style={styles.documentSubtitle}>{subtitle}</Text>
//         </View>
//         {type === 'credit' && item.Rating && (
//           <View style={[
//             styles.ratingBadge,
//             item.Rating === 'AAA' ? styles.ratingGood : styles.ratingNormal
//           ]}>
//             <Text style={styles.ratingText}>{item.Rating}</Text>
//           </View>
//         )}
//         <View style={styles.documentFooter}>
//           <Text style={styles.documentLink}>View Document</Text>
//           <Icon name="chevron-right" size={17} color="#6b7280" />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3b82f6" />
//       </View>
//     );
//   }

//   if (viewingFile) {
//     return (
//       <SafeAreaView style={styles.flex1}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => setViewingFile(null)}>
//             <Icon name="arrow-back" size={20} color="#3b82f6" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Document Viewer</Text>
//           <View style={{ width: 15 }} />
//         </View>
//         <WebView 
//           source={{ uri: `https://docs.google.com/viewer?url=${encodeURIComponent(viewingFile)}` }}
//           style={styles.flex1}
//           startInLoadingState={true}
//           renderLoading={() => (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="large" color="#3b82f6" />
//             </View>
//           )}
//         />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//         <View style={styles.innerContainer}>
//       {/* Annual Reports */}
//       <View style={styles.sectionContainer}>
//         <View style={styles.sectionHeader}>
//           <Icon name="description" size={18} color="#3b82f6" />
//           <Text style={styles.sectionTitle}>Annual Reports</Text>
//         </View>
//         {AnnualReport.length > 0 ? (
//           <FlatList
//             data={AnnualReport}
//             renderItem={({ item }) => renderDocumentItem({ item, type: 'annual' })}
//             keyExtractor={(item, index) => index.toString()}
//             scrollEnabled={false}
//           />
//         ) : (
//           <Text style={styles.emptyText}>No annual reports available</Text>
//         )}
//       </View>

//       {/* Credit Ratings */}
//       <View style={styles.sectionContainer}>
//         <View style={styles.sectionHeader}>
//           <Icon name="star" size={18} color="#f59e0b" />
//           <Text style={styles.sectionTitle}>Credit Ratings</Text>
//         </View>
//         {CreditRating.length > 0 ? (
//           <FlatList
//             data={CreditRating}
//             renderItem={({ item }) => renderDocumentItem({ item, type: 'credit' })}
//             keyExtractor={(item, index) => index.toString()}
//             scrollEnabled={false}
//           />
//         ) : (
//           <Text style={styles.emptyText}>No credit ratings available</Text>
//         )}
//       </View>

//       {/* Conference Calls */}
//       <View style={styles.sectionContainer}>
//         <View style={styles.sectionHeader}>
//           <Icon name="call" size={18} color="#10b981" />
//           <Text style={styles.sectionTitle}>Conference Calls</Text>
//         </View>
//         {ConferenceCall.length > 0 ? (
//           <FlatList
//             data={ConferenceCall}
//             renderItem={({ item }) => renderDocumentItem({ item, type: 'conference' })}
//             keyExtractor={(item, index) => index.toString()}
//             scrollEnabled={false}
//           />
//         ) : (
//           <Text style={styles.emptyText}>No conference calls available</Text>
//         )}
//       </View>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   flex1: {
//     flex: 1,
//   },
//   container: {
//     flexGrow: 1,
//     padding: 1,
//   },
//   innerContainer:{
//     display:'flex',
//     flexDirection:"column",
//     gap:20
//   },
//  loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     height: 200,
//   },
//   sectionContainer: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     // padding: 16,
//     // marginBottom: 30,
//     // shadowColor: '#000',
//     // shadowOffset: { width: 0, height: 1 },
//     // shadowOpacity: 0.1,
//     // shadowRadius: 3,
//     // elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     marginLeft: 8,
//     color: '#111827',
//   },
//   documentCard: {
//     backgroundColor: '#ffffff',
//     borderRadius: 8,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   documentHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent:"space-between"
//   },
//    documentHeadertitle: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   documentIcon: {
//     marginRight: 8,
//   },
//   documentTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   documentSubtitle: {
//     fontSize: 14,
//     color: '#6b7280',
//   },
//   documentFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     marginTop:26
//   },
//   documentLink: {
//     color: '#3b82f6',
//     fontSize: 12,
//     marginRight: 4,
//   },
//   ratingBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 4,
//     marginBottom: 8,
//   },
//   ratingGood: {
//     backgroundColor: '#ecfdf5',
//   },
//   ratingNormal: {
//     backgroundColor: '#fef3c7',
//   },
//   ratingText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   emptyText: {
//     color: '#6b7280',
//     textAlign: 'center',
//     paddingVertical: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e5e7eb',
//     backgroundColor: 'white',
//   },
//   headerTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#111827',
//   },
// });

// export default Documents;


















import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  useColorScheme,
  Dimensions,
  Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  getCompanyCode,
  getDocumentsData,
} from "../../../Unfluke_helpers/backend_helper";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";


const Documents = ({ companyName }) => {
  const route = useRoute();
  const params = route.params || {};
  const colorScheme = useColorScheme();
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const [loading, setLoading] = useState(true);
  const [companyCode, setCompanyCode] = useState(null);
  const [ASCR, setASCR] = useState([]);
  const [CreditRating, setCreditRating] = useState([]);
  const [AnnualReport, setAnnualReport] = useState([]);
  const [Announcements, setAnnouncements] = useState([]);
  const [ConferenceCall, setConferenceCall] = useState([]);
  const lastFetchedCompanyName = useRef(null);
  const [annualReportlink] = useState(
    "https://api.unfluke.in/api/historicdata/getannual"
  );

  // Dropdown state
  const [selectedDocType, setSelectedDocType] = useState("annual");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const documentTypes = [
    { label: "Annual Reports", value: "annual", icon: "📄" },
    { label: "Credit Ratings", value: "credit", icon: "⭐" },
    { label: "Conference Calls", value: "conference", icon: "📞" },
    // { label: "Announcements", value: "announcements", icon: "📢" },
    // { label: "ASCR", value: "ascr", icon: "📊" },
  ];

  useEffect(() => {
    if (lastFetchedCompanyName.current === companyName) return;

    async function getData() {
      setLoading(true);
      try {
        const result = await getCompanyCode({
          params: { instrument: companyName },
        });

        console.log("Documents results", result);

        if (result?.code) {
          const response = await getDocumentsData({
            params: { instrument: result.code },
          });

          console.log("actual docs data", response);

          setASCR(response.ASCR || []);
          setAnnualReport(response.AnnualReport || []);
          setAnnouncements(response.Announcement || []);
          setConferenceCall(response.ConferenceCalls || []);
          setCreditRating(response.CreditRating || []);
          setCompanyCode(result.code);
        } else {
          setASCR([]);
          setAnnouncements([]);
          setAnnualReport([]);
          setConferenceCall([]);
          setCreditRating([]);
        }
      } catch (error) {
        console.error("Error fetching company code:", error);
        setASCR([]);
        setAnnouncements([]);
        setAnnualReport([]);
        setConferenceCall([]);
        setCreditRating([]);
      } finally {
        setLoading(false);
        lastFetchedCompanyName.current = companyName;
      }
    }

    getData();
  }, [companyName]);

  const openLink = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    }
  };

  console.log()

  const renderDropdown = () => {
    const selectedType = documentTypes.find((type) => type.value === selectedDocType);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            isDark ? styles.dropdownButtonDark : styles.dropdownButtonLight,
          ]}
          onPress={() => setDropdownVisible(!dropdownVisible)}
          activeOpacity={0.7}
        >
          <View style={styles.dropdownButtonContent}>
            <Text style={styles.dropdownIcon}>{selectedType?.icon}</Text>
            <Text
              style={[
                styles.dropdownButtonText,
                isDark && styles.textWhite,
              ]}
            >
              {selectedType?.label}
            </Text>
          </View>
          <Text style={[styles.dropdownArrow, isDark && styles.textWhite]}>
            {dropdownVisible ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View
              style={[
                styles.dropdownMenu,
                isDark ? styles.dropdownMenuDark : styles.dropdownMenuLight,
              ]}
            >
              {documentTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.dropdownItem,
                    selectedDocType === type.value && styles.dropdownItemSelected,
                    isDark && selectedDocType === type.value && styles.dropdownItemSelectedDark,
                  ]}
                  onPress={() => {
                    setSelectedDocType(type.value);
                    setDropdownVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemIcon}>{type.icon}</Text>
                  <Text
                    style={[
                      styles.dropdownItemText,
                      isDark && styles.textWhite,
                      selectedDocType === type.value && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  const renderAnnualReports = () => (
    <ScrollView
      style={styles.contentScrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {AnnualReport && AnnualReport.length > 0 ? (
        [...AnnualReport]
          .sort((a, b) => b.Year - a.Year)
          .map((report, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.reportCard,
                isDark ? styles.borderDark : styles.borderLight,
              ]}
              onPress={() => openLink(report.Download_link)}
              activeOpacity={0.7}
            >
              <Text style={[styles.reportTitle, isDark && styles.textWhite]}>
                Financial Year {report.Year}
              </Text>
              <View style={styles.tagContainer}>
                {companyName === 476 && report.Year === 2024 ? (
                  <View style={[styles.tag, styles.tagBlue]}>
                    <Text style={styles.tagTextWhite}>Summary</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.tag,
                      isDark ? styles.tagDark : styles.tagLight,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        isDark ? styles.tagTextDark : styles.tagTextLight,
                      ]}
                    >
                      Available
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
      ) : (
        <Text style={[styles.emptyText, isDark && styles.textGray]}>
          No annual reports available.
        </Text>
      )}
    </ScrollView>
  );

  const renderCreditRatings = () => (
    <ScrollView
      style={styles.contentScrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {CreditRating.length > 0 ? (
        [...CreditRating]
          .sort((a, b) => {
            const yearA = parseInt(a.Date?.match(/\b\d{4}\b/)?.[0] || 0, 10);
            const yearB = parseInt(b.Date?.match(/\b\d{4}\b/)?.[0] || 0, 10);
            return yearB - yearA;
          })
          .map((report, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.ratingCard,
                isDark ? styles.borderDark : styles.borderLight,
              ]}
              onPress={() => openLink(report["Credit Rating URL"])}
              activeOpacity={0.7}
            >
              <Text style={[styles.ratingTitle, isDark && styles.textBlue]}>
                {report.Date?.split("from")[1]?.trim()?.toUpperCase() ||
                  "View Rating"}
              </Text>
              <Text style={[styles.ratingDate, isDark && styles.textGray]}>
                {report.Date?.split("from")[0]?.trim() ||
                  "Date not available"}
              </Text>
            </TouchableOpacity>
          ))
      ) : (
        <Text style={[styles.emptyText, isDark && styles.textGray]}>
          No credit ratings available.
        </Text>
      )}
    </ScrollView>
  );

  const renderConferenceCalls = () => (
    <ScrollView
      style={styles.contentScrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {ConferenceCall.length > 0 ? (
        [...ConferenceCall]
          .sort((a, b) => {
            const parseDate = (dateStr) => {
              if (!dateStr) return { year: 0, month: 0 };
              const [monthStr, yearStr] = dateStr.split("-");
              const monthMap = {
                Jan: 1,
                Feb: 2,
                Mar: 3,
                Apr: 4,
                May: 5,
                Jun: 6,
                Jul: 7,
                Aug: 8,
                Sep: 9,
                Oct: 10,
                Nov: 11,
                Dec: 12,
              };
              return {
                year: 2000 + parseInt(yearStr, 10),
                month: monthMap[monthStr] || 0,
              };
            };

            const dateA = parseDate(a["Date/Month-Year"]);
            const dateB = parseDate(b["Date/Month-Year"]);

            if (dateB.year !== dateA.year) return dateB.year - dateA.year;
            return dateB.month - dateA.month;
          })
          .map((doc, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.conferenceCard,
                isDark ? styles.borderDark : styles.borderLight,
              ]}
              onPress={() => openLink(doc.URL)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.conferenceTitle, isDark && styles.textWhite]}
              >
                Investor Meet - Outcome
              </Text>
              <View style={styles.dateContainer}>
                <Text
                  style={[styles.conferenceDate, isDark && styles.textGray]}
                >
                  {doc["Date/Month-Year"] || "No date provided"}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </View>
            </TouchableOpacity>
          ))
      ) : (
        <Text style={[styles.emptyText, isDark && styles.textGray]}>
          No conference calls available.
        </Text>
      )}
    </ScrollView>
  );

  const renderAnnouncements = () => (
    <ScrollView
      style={styles.contentScrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {Announcements.length > 0 ? (
        Announcements.map((announcement, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.reportCard,
              isDark ? styles.borderDark : styles.borderLight,
            ]}
            onPress={() => openLink(announcement.URL)}
            activeOpacity={0.7}
          >
            <Text style={[styles.reportTitle, isDark && styles.textWhite]}>
              {announcement.Title || `Announcement ${index + 1}`}
            </Text>
            {announcement.Date && (
              <Text style={[styles.ratingDate, isDark && styles.textGray]}>
                {announcement.Date}
              </Text>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.emptyText, isDark && styles.textGray]}>
          No announcements available.
        </Text>
      )}
    </ScrollView>
  );

  const renderASCR = () => (
    <ScrollView
      style={styles.contentScrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {ASCR.length > 0 ? (
        ASCR.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.reportCard,
              isDark ? styles.borderDark : styles.borderLight,
            ]}
            onPress={() => openLink(item.URL)}
            activeOpacity={0.7}
          >
            <Text style={[styles.reportTitle, isDark && styles.textWhite]}>
              {item.Title || `ASCR Document ${index + 1}`}
            </Text>
            {item.Date && (
              <Text style={[styles.ratingDate, isDark && styles.textGray]}>
                {item.Date}
              </Text>
            )}
          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.emptyText, isDark && styles.textGray]}>
          No ASCR documents available.
        </Text>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (selectedDocType) {
      case "annual":
        return renderAnnualReports();
      case "credit":
        return renderCreditRatings();
      case "conference":
        return renderConferenceCalls();
      case "announcements":
        return renderAnnouncements();
      case "ascr":
        return renderASCR();
      default:
        return renderAnnualReports();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={c.gold} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {renderDropdown()}
      {renderContent()}
    </View>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },
    containerDark: {
      backgroundColor: c.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 128,
      backgroundColor: "transparent",
    },
    // Dropdown styles
    dropdownContainer: {
      paddingBottom: 8,
    },
    dropdownButton: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 12,
      padding: 10,
      backgroundColor: c.card,
    },
    dropdownButtonLight: {
      borderColor: c.border,
      backgroundColor: c.card,
    },
    dropdownButtonDark: {
      borderColor: c.border,
      backgroundColor: c.card,
    },
    dropdownButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dropdownIcon: {
      fontSize: 18,
    },
    dropdownButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: c.text,
    },
    dropdownArrow: {
      fontSize: 12,
      color: c.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    dropdownMenu: {
      width: "90%",
      maxWidth: 400,
      borderRadius: 12,
      borderWidth: 1,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.5 : 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    dropdownMenuLight: {
      backgroundColor: c.card,
      borderColor: c.border,
    },
    dropdownMenuDark: {
      backgroundColor: c.card,
      borderColor: c.border,
    },
    dropdownItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    dropdownItemSelected: {
      backgroundColor: c.goldLight,
    },
    dropdownItemSelectedDark: {
      backgroundColor: c.goldLight,
    },
    dropdownItemIcon: {
      fontSize: 20,
    },
    dropdownItemText: {
      fontSize: 15,
      fontWeight: "500",
      color: c.text,
    },
    dropdownItemTextSelected: {
      fontWeight: "600",
      color: c.gold,
    },
    // Content styles
    contentScrollView: {
      flex: 1,
    },
    contentContainer: {
      // padding: 16,
      paddingTop: 8,
    },
    reportCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    borderLight: {
      borderColor: c.border,
      backgroundColor: c.card,
    },
    borderDark: {
      borderColor: c.border,
      backgroundColor: c.card,
    },
    reportTitle: {
      fontWeight: "bold",
      fontSize: 16,
      color: c.text,
      marginBottom: 8,
    },
    tagContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tagBlue: {
      backgroundColor: c.gold,
    },
    tagLight: {
      backgroundColor: c.surfaceElevated,
    },
    tagDark: {
      backgroundColor: c.surfaceElevated,
    },
    tagText: {
      fontSize: 12,
      fontWeight: "600",
    },
    tagTextWhite: {
      color: c.onGold,
      fontSize: 12,
      fontWeight: "500",
    },
    tagTextLight: {
      color: c.textSecondary,
    },
    tagTextDark: {
      color: c.textSecondary,
    },
    ratingCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    ratingTitle: {
      color: c.gold,
      fontWeight: "bold",
      fontSize: 14,
      marginBottom: 8,
    },
    ratingDate: {
      fontSize: 12,
      color: c.textSecondary,
      marginTop: 8,
    },
    conferenceCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    conferenceTitle: {
      fontWeight: "bold",
      fontSize: 16,
      color: c.text,
      marginBottom: 8,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    conferenceDate: {
      fontSize: 14,
      color: c.textSecondary,
    },
    calendarIcon: {
      fontSize: 16,
    },
    emptyText: {
      color: c.textSecondary,
      fontSize: 14,
      textAlign: "center",
      paddingVertical: 40,
    },
    textWhite: {
      color: c.text,
    },
    textGray: {
      color: c.textSecondary,
    },
    textBlue: {
      color: c.gold,
    },
  });

export default Documents;
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { getSearch } from "../constants/Unfluke_helpers/backend_helper";
import { Search, X } from "react-native-feather";
import { useWindowDimensions } from "react-native";
import { useTheme } from "@/constants/ThemeContext";
import type { AppColors } from "@/constants/Colors";

const SearchOption = ({ setCompany }) => {
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const fetchSearchResults = async (query) => {
    try {
      const response = await getSearch({
        params: { searchQuery: query },
      });
      setResults(response || []);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setResults([]);
    }
  };

  const onChangeData = (val) => {
    setValue(val);
    if (val.trim() === "") {
      setResults([]);
      setDropdownOpen(false);
    } else {
      fetchSearchResults(val);
      setDropdownOpen(true);
    }
  };

  const handleResultPress = (capitalineCode) => {
    setCompany(capitalineCode);
    setDropdownOpen(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search width={16} height={16} color={c.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search Company..."
          placeholderTextColor={c.textMuted}
          value={value}
          onChangeText={onChangeData}
          onFocus={() => value.length > 0 && setDropdownOpen(true)}
        />
        {value ? (
          <TouchableOpacity
            onPress={() => {
              setValue("");
              setResults([]);
              setDropdownOpen(false);
            }}
            style={styles.clearButton}
          >
            <X width={16} height={16} color={c.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {isDropdownOpen && (
        <View style={styles.dropdownContainer}>
          <FlatList
            data={results}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="always"
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleResultPress(item["Capitaline Code"])}
              >
                <Text style={styles.resultText}>{item["Company Name"]}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>No results found</Text>
              </View>
            }
            style={styles.dropdownList}
          />
        </View>
      )}
    </View>
  );
};

const makeStyles = (c: AppColors, isDark: boolean) =>
  StyleSheet.create({
    container: {
      width: '100%',
      zIndex: 1, // Ensure dropdown appears above other content
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.inputBorder,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: c.inputBg,
    },
    searchIcon: {
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: c.text,
      padding: 0,
    },
    clearButton: {
      padding: 4,
    },
    dropdownContainer: {
      position: 'relative',
      marginTop: 4,
      maxHeight: 200,
    },
    dropdownList: {
      backgroundColor: c.card,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: c.border,
    },
    resultItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.borderLight,
    },
    resultText: {
      fontSize: 14,
      color: c.text,
    },
    noResults: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: 14,
      color: c.textSecondary,
    },
  });

export default SearchOption;
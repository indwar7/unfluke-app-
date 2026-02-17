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

const SearchOption = ({ setCompany }) => {
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
        <Search width={16} height={16} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search Company..."
          placeholderTextColor="#9ca3af"
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
            <X width={16} height={16} color="#9ca3af" />
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

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1, // Ensure dropdown appears above other content
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
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
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultText: {
    fontSize: 14,
    color: '#111827',
  },
  noResults: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default SearchOption;
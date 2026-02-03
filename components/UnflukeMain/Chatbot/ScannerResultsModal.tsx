import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import ScannerResults from '../Scanner/ScannerResults';

const ScannerResultsModal = ({ modalOpen, setModalOpen, resultsObj, type }) => {
  const { width, height } = useWindowDimensions()

  const toggle = () => setModalOpen(!modalOpen);

  const { results, link, headers } = resultsObj || {};

  return (
    <Modal
      visible={modalOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={toggle}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer,{    width: width * 0.9,
    height:height*0.5,
    maxHeight: height * 0.8,}]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>unfluke.in says</Text>
            </View>

            {/* Modal Body */}
            <View style={[styles.modalBody,{    maxHeight: height * 0.6,
}]}>
              <ScrollView>
                <ScannerResults 
                  results={results} 
                  downloadUrl={link} 
                  type={type} 
                  headers={headers} 
                />
              </ScrollView>
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={toggle}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {

    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ScannerResultsModal;
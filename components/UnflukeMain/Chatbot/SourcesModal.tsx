import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking,
  ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SourcesModal({ sourcesModalOpen, setSourcesModalOpen, sources }) {
  const toggle = () => setSourcesModalOpen(!sourcesModalOpen);

  const openNewPage = async (source) => {
    const url = typeof source === 'string' ? source : source?.url ?? source?.link;
    try {
      if (url && /^https?:\/\//.test(url)) {
        await Linking.openURL(url);
      } else {
        await AsyncStorage.setItem('source', JSON.stringify(source));
      }
    } catch (error) {
      console.error('Error opening source:', error);
    }
  };

  return (
    <Modal
      visible={sourcesModalOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={toggle}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderText}>Sources</Text>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {sources && Object.keys(sources).map((topic, i) => (
              <View key={i} style={styles.sourceItem}>
                <Text style={styles.topicText}>{topic} - </Text>
                <TouchableOpacity onPress={() => openNewPage(sources[topic])}>
                  <Text style={styles.linkText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={toggle}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  modalHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 15,
    maxHeight: 300,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicText: {
    fontSize: 16,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  modalFooter: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SourcesModal;
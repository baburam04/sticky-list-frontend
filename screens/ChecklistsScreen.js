// screens/ChecklistsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  TextInput,
  Keyboard,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

const ChecklistsScreen = () => {
  const [checklists, setChecklists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChecklistName, setNewChecklistName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const navigation = useNavigation();
  const navigateToDashboard = (checklist) => {
  navigation.navigate('ChecklistDetails', { checklist });
};

  // Load checklists from storage
  useEffect(() => {
    const loadChecklists = async () => {
      try {
        const response = await api.get('/api/checklists');
        setChecklists(response.data.checklists);
      } catch (error) {
        console.error('Failed to load checklists:', error);
        Alert.alert('Error', 'Failed to load checklists');
      }
    };
    loadChecklists();
  }, []);

  // Save checklists to storage
  useEffect(() => {
    const saveChecklists = async () => {
      try {
        await AsyncStorage.setItem('checklists', JSON.stringify(checklists));
      } catch (error) {
        console.error('Failed to save checklists:', error);
      }
    };
    if (checklists.length > 0) saveChecklists();
  }, [checklists]);

  // Filter checklists based on search query
  const filteredChecklists = checklists.filter(checklist =>
    checklist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create new checklist
  const createChecklist = async () => {
    if (newChecklistName.trim()) {
      try {
        const response = await api.post('/api/checklists', {
          title: newChecklistName.trim()
        });
        setChecklists([response.data.checklist, ...checklists]);
        setNewChecklistName('');
        setShowInput(false);
        Keyboard.dismiss();
      } catch (error) {
        Alert.alert('Error', 'Failed to create checklist');
      }
    }
  };

  // Delete checklist
const deleteChecklist = async (checklistId) => {
  try {
    await api.delete(`/api/checklists/${checklistId}`);
    setChecklists(checklists.filter(item => item.id !== checklistId)); // Change to match your API response structure
  } catch (error) {
    Alert.alert('Error', 'Failed to delete checklist');
  }
};

  // Render each checklist item
  const renderChecklistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.checklistItem}
      onPress={() => navigateToDashboard(item)}
    >
      <View style={styles.checklistContent}>
        <Text style={styles.checklistTitle}>{item.title}</Text>
        <Text style={styles.checklistDate}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteChecklist(item.id)}
      >
        <Icon name="delete" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search checklists..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* New Checklist Input (shown when plus button is pressed) */}
      {showInput && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Enter checklist name"
            value={newChecklistName}
            onChangeText={setNewChecklistName}
            autoFocus={true}
            onSubmitEditing={createChecklist}
            placeholderTextColor="#888"
          />
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={createChecklist}
            disabled={!newChecklistName.trim()}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Checklists List */}
      <FlatList
        data={filteredChecklists}
        renderItem={renderChecklistItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching checklists found' : 'No checklists yet'}
          </Text>
        }
      />

      {/* Add Checklist Button */}
      {!showInput && (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowInput(true)}
        >
          <Icon name="add" size={30} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  checklistDate: {
    fontSize: 13,
    color: '#888',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default ChecklistsScreen;
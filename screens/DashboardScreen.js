import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';

const COLORS = ['#FFD180', '#80D8FF', '#CFD8DC', '#AED581', '#FF8A80'];

const DashboardScreen = ({ navigation }) => {
  const route = useRoute();
  // Fixed parameter extraction to match what's sent from ChecklistsScreen
  const { checklist } = route.params;
  const checklistId = checklist?.id;
  const checklistTitle = checklist?.title;
  
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [selectedColor, setSelectedColor] = useState('#80D8FF');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Load tasks for this checklist
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await api.get(`/api/tasks/checklist/${checklistId}`);
        setTasks(response.data.tasks);
      } catch (error) {
        Alert.alert('Error', 'Failed to load tasks');
      }
    };
    loadTasks();
  }, [checklistId]);

  // Save tasks for this checklist
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem(`tasks_${checklistId}`, JSON.stringify(tasks));
      } catch (error) {
        Alert.alert('Error', 'Failed to save tasks');
      }
    };
    saveTasks();
  }, [tasks, checklistId]);

  const addTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await api.post('/api/tasks', {
          title: newTask.trim(),
          checklist: checklistId,
          color: selectedColor
        });
        setTasks([response.data.task, ...tasks]);
        setNewTask('');
        setShowColorPicker(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to add task');
      }
    }
  };

  const toggleComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? {...task, completed: !task.completed} : task
    ));
  };

  const togglePin = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? {...task, pinned: !task.pinned} : task
    ));
  };

  const deleteTask = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              // Fixed API call to use the api service instead of fetch
              await api.delete(`/api/tasks/${taskId}`);
              
              // Update local state
              const filteredTasks = tasks.filter(task => task.id !== taskId);
              setTasks(filteredTasks);
              
              // Update AsyncStorage
              await AsyncStorage.setItem(
                `tasks_${checklistId}`,
                JSON.stringify(filteredTasks)
              );

            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete task');
            }
          }
        }
      ]
    );
  };
  
  const TaskItem = ({ task }) => (
    <View style={[styles.taskItem, {backgroundColor: task.color}]}>
      <TouchableOpacity onPress={() => toggleComplete(task.id)}>
        <Icon 
          name={task.completed ? "check-box" : "check-box-outline-blank"} 
          size={24} 
          color={task.completed ? "#000" : "rgba(0,0,0,0.7)"}
        />
      </TouchableOpacity>

      <Text style={[styles.taskText, task.completed && styles.completedText]}>
        {task.text}
      </Text>

      <View style={styles.taskActions}>
        <TouchableOpacity onPress={() => togglePin(task.id)}>
          <Icon 
            name={task.pinned ? "push-pin" : "outlined-flag"} 
            size={20} 
            color={task.pinned ? "#000" : "rgba(0,0,0,0.7)"}
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => deleteTask(task.id)}>
          <Icon name="delete" size={20} color="rgba(0,0,0,0.7)" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{checklistTitle || 'Tasks'}</Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
          placeholderTextColor="#888"
        />
        <TouchableOpacity 
          style={[styles.colorPreview, {backgroundColor: selectedColor}]}
          onPress={() => setShowColorPicker(!showColorPicker)}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {showColorPicker && (
        <View style={styles.colorPicker}>
          {COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption, 
                {backgroundColor: color},
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => {
                setSelectedColor(color);
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      )}

      <ScrollView style={styles.tasksContainer}>
        {/* Pinned Tasks */}
        {tasks.filter(t => t.pinned).map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
        
        {/* Unpinned Tasks */}
        {tasks.filter(t => !t.pinned).map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    backgroundColor: 'white',
    fontSize: 16,
    marginRight: 10,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#000',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksContainer: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    marginHorizontal: 15,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
});

export default DashboardScreen;
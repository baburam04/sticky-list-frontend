import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ChecklistsScreen from "./screens/ChecklistsScreen";
import DashboardScreen from "./screens/DashboardScreen";
import 'react-native-gesture-handler';
import 'react-native-reanimated';

const Stack = createStackNavigator();

export default function App() {
    return (
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#4CAF50', // Green header to match theme
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Checklists" 
            component={ChecklistsScreen} 
            options={{ title: "My Checklists" }}
          />
          <Stack.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={({ route }) => ({ 
              title: route.params?.checklist?.title || "Tasks",
              headerShown: false // Since we're handling our own header in the component
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
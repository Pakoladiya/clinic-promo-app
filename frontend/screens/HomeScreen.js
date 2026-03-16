import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Content from '../Content';
import Profile from '../Profile';

const Stack = createStackNavigator();

const HomeScreen = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Content" component={Content} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
};

export default HomeScreen;
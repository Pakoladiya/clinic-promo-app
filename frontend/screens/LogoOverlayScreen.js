import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LogoOverlayScreen = ({ imageUri }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <Image source={require('./path_to_logo.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logo: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
});

export default LogoOverlayScreen;
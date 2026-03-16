import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';

const ProfileScreen = () => {
    const [clinicName, setClinicName] = useState('');
    const [clinicInfo, setClinicInfo] = useState('');
    const [logoUri, setLogoUri] = useState('');

    const handleLogoUpload = () => {
        // Logic for logo upload goes here
    };

    const handleSaveProfile = () => {
        // Logic for saving profile information goes here
        console.log('Profile saved:', { clinicName, clinicInfo, logoUri });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Profile</Text>
            <Image
                source={{ uri: logoUri || 'placeholder_image_url' }}
                style={styles.logo}
            />
            <Button title="Upload Logo" onPress={handleLogoUpload} />
            <TextInput
                style={styles.input}
                placeholder="Clinic Name"
                value={clinicName}
                onChangeText={setClinicName}
            />
            <TextInput
                style={[styles.input, styles.textInput]}
                placeholder="Clinic Information"
                value={clinicInfo}
                onChangeText={setClinicInfo}
                multiline
            />
            <Button title="Save Profile" onPress={handleSaveProfile} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    textInput: {
        height: 100,
    },
});

export default ProfileScreen;
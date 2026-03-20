import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const DetailsScreen = ({ route, navigation }) => {
    const { content } = route.params;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            <Text style={styles.discipline}>{content.discipline}</Text>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.body}>{content.body}</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('LogoOverlay', { content })}
            >
                <Text style={styles.buttonText}>Add My Logo & Share</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    inner: { padding: 22, paddingBottom: 48 },
    discipline: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1a73e8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
        lineHeight: 32,
    },
    body: {
        fontSize: 16,
        color: '#444',
        lineHeight: 26,
        marginBottom: 36,
    },
    button: {
        backgroundColor: '#1a73e8',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default DetailsScreen;

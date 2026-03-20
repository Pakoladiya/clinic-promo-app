import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { fetchContentByDiscipline } from '../services/contentService';

const DISCIPLINES = ['Physio', 'Ophthalmology', 'Cardiology', 'Dermatology'];

const ContentLibraryScreen = ({ navigation }) => {
    const [selectedDiscipline, setSelectedDiscipline] = useState(DISCIPLINES[0]);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadContent();
    }, [selectedDiscipline]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const data = await fetchContentByDiscipline(selectedDiscipline);
            setContents(data);
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.filterRow}>
                {DISCIPLINES.map(d => (
                    <TouchableOpacity
                        key={d}
                        style={[styles.chip, selectedDiscipline === d && styles.chipActive]}
                        onPress={() => setSelectedDiscipline(d)}
                    >
                        <Text style={[styles.chipText, selectedDiscipline === d && styles.chipTextActive]}>
                            {d}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator style={styles.loader} size="large" color="#1a73e8" />
            ) : (
                <FlatList
                    data={contents}
                    keyExtractor={item => String(item.id)}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No content for {selectedDiscipline} yet.</Text>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            onPress={() => navigation.navigate('Details', { content: item })}
                        >
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4ff' },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        paddingBottom: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: '#e8eaf6',
        marginRight: 8,
        marginBottom: 8,
    },
    chipActive: { backgroundColor: '#1a73e8' },
    chipText: { color: '#555', fontSize: 13, fontWeight: '500' },
    chipTextActive: { color: '#fff', fontWeight: '600' },
    loader: { marginTop: 50 },
    list: { padding: 16, paddingTop: 4 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 18,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 5 },
    cardBody: { fontSize: 14, color: '#666', lineHeight: 20 },
    empty: { textAlign: 'center', color: '#aaa', marginTop: 60, fontSize: 15 },
});

export default ContentLibraryScreen;

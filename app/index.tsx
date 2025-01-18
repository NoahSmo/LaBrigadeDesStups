import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoomTable from "@/components/table";
import Toast from 'react-native-toast-message';

const App: React.FC = () => {
    const [roomNumber, setRoomNumber] = useState<number | null>(null);
    const [dafalgan, setDafalgan] = useState<boolean>(false);
    const [acupan, setAcupan] = useState<boolean>(false);
    const [interdose, setInterdose] = useState<boolean>(false);
    const [bedLocation, setBedLocation] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>([]);
    const [sortedAscending, setSortedAscending] = useState<boolean>(true);

    const sortData = () => {
        const sortedData = [...tableData].sort((a, b) =>
            sortedAscending ? a.roomNumber - b.roomNumber : b.roomNumber - a.roomNumber
        );
        setTableData(sortedData);
        setSortedAscending(!sortedAscending);
    };


    // Totals
    const [totalDafalgan, setTotalDafalgan] = useState<number>(0);
    const [totalAcupan, setTotalAcupan] = useState<number>(0);
    const [totalInterdose, setTotalInterdose] = useState<number>(0);
    const [uniqueRoomsVisited, setUniqueRoomsVisited] = useState<number>(0);
    const [patientsServiced, setPatientsServiced] = useState<number>(0);

    // Load data when the component mounts
    useEffect(() => {
        reloadData();
    }, []);

    const saveData = async () => {
        if (!roomNumber) {
            Alert.alert('Erreur', 'Veuillez entrer un numéro de chambre valide');
            return;
        }

        const newData = {
            roomNumber,
            bedLocation,
            dafalgan: dafalgan ? 'X' : '',
            acupan: acupan ? 'X' : '',
            interdose: interdose ? 'X' : '',
            hour: new Date().toLocaleTimeString(),
        };

        try {
            const storedData = await AsyncStorage.getItem('roomData');
            const parsedData = storedData ? JSON.parse(storedData) : [];
            parsedData.push(newData);

            // Sort the data after adding the new entry
            const sortedData = [...parsedData].sort((a, b) =>
                sortedAscending ? a.roomNumber - b.roomNumber : b.roomNumber - a.roomNumber
            );

            await AsyncStorage.setItem('roomData', JSON.stringify(sortedData));

            setTableData(sortedData);

            // Recalculate totals
            calculateTotals(sortedData);

            // Alert.alert('Succès', 'Données sauvegardées avec succès');
            Toast.show({
                type: 'success',
                text1: 'Succès',
                text2: 'Données sauvegardées avec succès',
            });

            clearForm();
        } catch (e) {
            Alert.alert('Erreur', 'Échec de la sauvegarde des données');
        }
    };

    const reloadData = async () => {
        try {
            const storedData = await AsyncStorage.getItem('roomData');
            const parsedData = storedData ? JSON.parse(storedData) : [];
            setTableData(parsedData);

            // Recalculate totals
            calculateTotals(parsedData);
        } catch (e) {
            Alert.alert('Erreur', 'Échec du chargement des données');
        }
    };

    const calculateTotals = (data: any[]) => {
        let dafalganCount = 0;
        let acupanCount = 0;
        let interdoseCount = 0;
        const visitedRooms = new Set<number>();
        const totalPatients = data.length;

        data.forEach((entry) => {
            if (entry.dafalgan) dafalganCount++;
            if (entry.acupan) acupanCount++;
            if (entry.interdose) interdoseCount++;
            visitedRooms.add(entry.roomNumber);
        });

        setTotalDafalgan(dafalganCount);
        setTotalAcupan(acupanCount);
        setTotalInterdose(interdoseCount);
        setUniqueRoomsVisited(visitedRooms.size);
        setPatientsServiced(totalPatients);
    };

    const resetData = () => {
        Alert.alert('Confirmation', 'Êtes-vous sûr de vouloir réinitialiser les données ?', [
            {
                text: 'Annuler',
                style: 'cancel',
            },
            {
                text: 'Confirmer',
                onPress: () => {
                    clearForm();
                    setTableData([]);
                    setTotalDafalgan(0);
                    setTotalAcupan(0);
                    setTotalInterdose(0);
                    setUniqueRoomsVisited(0);
                    setPatientsServiced(0);
                    AsyncStorage.removeItem('roomData');
                    Alert.alert('Succès', 'Données réinitialisées avec succès');
                },
            },
        ]);
    };

    const clearForm = () => {
        setRoomNumber(null);
        setDafalgan(false);
        setAcupan(false);
        setInterdose(false);
        setBedLocation(null);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Gestion des Antalgiques</Text>

            <View style={styles.radioContainer}>
                <Text style={styles.label}>Numéro de chambre :</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Entrez le numéro de chambre"
                    value={roomNumber ? roomNumber.toString() : ''}
                    onChangeText={(text) => setRoomNumber(text === '' ? null : parseInt(text, 10))}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.radioContainer}>
                <Text style={styles.label}>Emplacement du lit (Optionnel) :</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity
                        style={[
                            styles.radioOption,
                            bedLocation === 'F' && styles.radioSelected,
                        ]}
                        onPress={() => setBedLocation(bedLocation === 'F' ? null : 'F')}
                    >
                        <Text style={styles.radioLabel}>Fenêtre</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.radioOption,
                            bedLocation === 'P' && styles.radioSelected,
                        ]}
                        onPress={() => setBedLocation(bedLocation === 'P' ? null : 'P')}
                    >
                        <Text style={styles.radioLabel}>Porte</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.medicationContainer}>
                <Text style={styles.label}>Médicaments :</Text>
                <View style={styles.medicationGroup}>
                    <TouchableOpacity
                        style={[
                            styles.medicationButton,
                            dafalgan && styles.selectedMedication,
                        ]}
                        onPress={() => setDafalgan(!dafalgan)}
                    >
                        <Text style={styles.medicationLabel}>Dafalgan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.medicationButton,
                            acupan && styles.selectedMedication,
                        ]}
                        onPress={() => setAcupan(!acupan)}
                    >
                        <Text style={styles.medicationLabel}>Acupan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.medicationButton,
                            interdose && styles.selectedMedication,
                        ]}
                        onPress={() => setInterdose(!interdose)}
                    >
                        <Text style={styles.medicationLabel}>Interdose</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        (!roomNumber || (!dafalgan && !acupan && !interdose)) && styles.disabledButton,
                    ]}
                    onPress={saveData}
                    disabled={!roomNumber || (!dafalgan && !acupan && !interdose)}
                >
                    <Text style={styles.buttonText}>Sauvegarder</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={resetData}>
                    <Text style={styles.buttonText}>Réinitialiser</Text>
                </TouchableOpacity>
            </View>

            <RoomTable
                tableData={tableData}
                sortData={sortData}
            />

            <View style={styles.totalsContainer}>
                <View style={styles.totalsItem}>
                    <Text style={styles.totalsLabel}>Dafalgan</Text>
                    <Text style={styles.totalsValue}>{totalDafalgan}</Text>
                </View>
                <View style={styles.totalsItem}>
                    <Text style={styles.totalsLabel}>Acupan</Text>
                    <Text style={styles.totalsValue}>{totalAcupan}</Text>
                </View>
                <View style={styles.totalsItem}>
                    <Text style={styles.totalsLabel}>Interdose</Text>
                    <Text style={styles.totalsValue}>{totalInterdose}</Text>
                </View>
                {/*<View style={styles.totalsItem}>*/}
                {/*    <Text style={styles.totalsLabel}>Chambres</Text>*/}
                {/*    <Text style={styles.totalsValue}>{uniqueRoomsVisited}</Text>*/}
                {/*</View>*/}
                <View style={styles.totalsItem}>
                    <Text style={styles.totalsLabel}>Patients</Text>
                    <Text style={styles.totalsValue}>{patientsServiced}</Text>
                </View>
            </View>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f9fafb',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    radioContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#555',
        marginBottom: 10,
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    radioOption: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        backgroundColor: '#f9f9f9',
    },
    radioSelected: {
        borderColor: '#007BFF',
        backgroundColor: '#e6f7ff',
    },
    radioLabel: {
        fontSize: 16,
        color: '#333',
    },
    medicationContainer: {
        marginBottom: 20,
    },
    medicationGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    medicationButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        backgroundColor: '#f9f9f9',
    },
    selectedMedication: {
        borderColor: '#007BFF',
        backgroundColor: '#e6f7ff',
    },
    medicationLabel: {
        fontSize: 16,
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#007BFF',
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#FF4D4F',
        paddingVertical: 15,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#ccc',
        borderColor: '#aaa',
    },
    totalsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    totalsItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    totalsLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginBottom: 5,
    },
    totalsValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default App;

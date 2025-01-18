import {DataTable} from 'react-native-paper';
import {Alert, SafeAreaView, StyleSheet, Text} from 'react-native';
import React from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RoomTableProps {
    tableData: any[];
    sortData: () => void;
}

const RoomTable: React.FC<RoomTableProps> = ({tableData, sortData}) => {
    return (
        <SafeAreaView style={styles.container}>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title
                        onPress={sortData}
                        style={styles.sortableHeader}
                    >
                        Chambre
                    </DataTable.Title>
                    <DataTable.Title style={styles.textCenter}>Dafalgan</DataTable.Title>
                    <DataTable.Title style={styles.textCenter}>Acupan</DataTable.Title>
                    <DataTable.Title style={styles.textCenter}>Interdose</DataTable.Title>
                    <DataTable.Title style={styles.textCenter}>Heure</DataTable.Title>
                </DataTable.Header>

                {tableData.map((row, index) => (
                    <DataTable.Row key={index}>
                        <DataTable.Cell>
                            {row.roomNumber}
                            {row.bedLocation ? `-${row.bedLocation}` : ''}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles.textCenter}>{row.dafalgan}</DataTable.Cell>
                        <DataTable.Cell style={styles.textCenter}>{row.acupan}</DataTable.Cell>
                        <DataTable.Cell style={styles.textCenter}>{row.interdose}</DataTable.Cell>
                        <DataTable.Cell style={styles.textCenter}>{row.hour.substring(0, 5)}</DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 15,
    },
    tableScroll: {
        marginVertical: 15,
    },
    sortableHeader: {
        flex: 1,
        fontWeight: 'bold',
    },
    textCenter: {
        justifyContent: 'center', // Aligns content horizontally within the cell
        textAlign: 'center', // Centers text within the cell
    },
});

export default RoomTable;

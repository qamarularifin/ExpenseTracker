import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { TouchableOpacity } from 'react-native';

interface DataItem {
  ID: number;
  TransactionDate: string;
  Description: string;
  Amount: number;
  ExpenseType: string;
  Category: string;
}

type SortOrder = 'asc' | 'desc';

const App: React.FC = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof DataItem | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch data from the backend
    axios.get('http://192.168.1.7:3001/expenses')
      .then(response => {
        console.log('Fetched data:', response.data); // Log the fetched data
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log('Data state updated:', data); // Log data state changes
  }, [data]);

  const handleSort = (column: keyof DataItem) => {
    let newSortOrder: SortOrder = 'asc';
    if (sortColumn === column && sortOrder === 'asc') {
      newSortOrder = 'desc';
    }
    setSortColumn(column);
    setSortOrder(newSortOrder);

    const sortedData = [...data].sort((a, b) => {
      if (a[column] < b[column]) return newSortOrder === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return newSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setData(sortedData);
  };

  const filterDataByDateRange = (data: DataItem[], startDate: Date | null, endDate: Date | null) => {
    if (!startDate && !endDate) return data;

    return data.filter(item => {
      const itemDate = new Date(item.TransactionDate).setHours(0, 0, 0, 0); // Normalize to midnight
      if (startDate && endDate) {
        console.log("sd", startDate)
        console.log("ed", endDate)
        console.log("itemDate", item)
        return itemDate >= startDate.setHours(0, 0, 0, 0) && itemDate <= endDate.setHours(23, 59, 59, 999);
      }
      if (startDate) {
        return itemDate >= startDate.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        return itemDate <= endDate.setHours(23, 59, 59, 999);
      }
      return true;
    });
  };



  const onStartDateChange = (event: any, date?: Date) => {
    setStartDate(date || startDate);
  };

  const onEndDateChange = (event: any, date?: Date) => {
    setEndDate(date || endDate);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No data available!!!</Text>
      </View>
    );
  }

  const filteredData = filterDataByDateRange(data, startDate, endDate);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.table}>
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerLabel}>Start Date:</Text>
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        </View>
        <View style={styles.datePickerContainer}>
          <Text style={styles.datePickerLabel}>End Date:</Text>
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        </View>
        <View style={styles.tableHeader}>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('TransactionDate')}>
            <Text style={styles.tableHeaderText}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('Description')}>
            <Text style={styles.tableHeaderText}>Description</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('Amount')}>
            <Text style={styles.tableHeaderText}>Amount</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('ExpenseType')}>
            <Text style={styles.tableHeaderText}>ExpenseType</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tableHeaderCell} onPress={() => handleSort('Category')}>
            <Text style={styles.tableHeaderText}>Category</Text>
          </TouchableOpacity>
        </View>
        {filteredData.map((item) => (
          <View key={item.ID} style={styles.tableRow}>
            <Text style={styles.tableCell}>{new Date(item.TransactionDate).toLocaleDateString()}</Text>
            <Text style={styles.tableCell}>{item.Description}</Text>
            <Text style={styles.tableCell}>{item.Amount.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{item.ExpenseType}</Text>
            <Text style={styles.tableCell}>{item.Category}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue', // Temporary color for debugging
  },
  table: {
    margin: 20,
    width: '100%', // Ensure the table takes up full width
    backgroundColor: 'lightgreen', // Temporary color for debugging
  },
  datePickerContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  datePickerLabel: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  tableHeaderCell: {
    flex: 1,
    alignItems: 'center', // Center align header text
  },
  tableHeaderText: {
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center', // Center align cell text
  },
});

export default App;

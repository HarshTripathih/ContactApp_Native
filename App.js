import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formType, setFormType] = useState('add');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    axios.get('https://dummyjson.com/users')
      .then(response => {
        setContacts(response.data.users);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const filterContacts = () => {
    // Filter the contacts based on the search query
    const filteredContacts = contacts.filter((contact) => {
      return (
        (contact.firstName && contact.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (contact.phone && contact.phone.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    // If no contacts are found and the search query is not empty, show a message
    if (filteredContacts.length === 0 && searchQuery !== '') {
      return [{ id: 'no-results-found', firstName: 'No contacts found.' }];
    }

    // Otherwise, return the filtered contacts
    return filteredContacts;
  };

  const handleContactPress = (contact) => {
    setSelectedContact(contact);
    setFormType('edit');
    setFirstName(contact.firstName);
    setLastName(contact.lastName);
    setPhone(contact.phone);
    setModalVisible(true);
  };

  const handleAddContact = () => {
    const newContact = {
      id: Math.random().toString(),
      firstName,
      lastName,
      phone,
    };
    setContacts([...contacts, newContact]);
    setModalVisible(false);
    setFirstName('');
    setLastName('');
    setPhone('');
  };

  const handleUpdateContact = () => {
    const updatedContact = {
      ...selectedContact,
      firstName,
      lastName,
      phone,
    };
    const updatedContacts = [...contacts];
    const index = updatedContacts.findIndex(c => c.id === updatedContact.id);
    updatedContacts[index] = updatedContact;
    setContacts(updatedContacts);
    setModalVisible(false);
    setSelectedContact(null);
    setFirstName('');
    setLastName('');
    setPhone('');
  };

  const handleDeleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: () => {
            const updatedContacts = contacts.filter(c => c.id !== contactId);
            setContacts(updatedContacts);
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleContactPress(item)}
      >
        <View>
          <Text style={styles.contactName}>{item.firstName}</Text>
          <Text style={styles.contactNumber}>
            {item.phone && item.phone}
          </Text>
        </View>
        <View style={styles.contactActionButtonsContainer}>
          <TouchableOpacity onPress={() => handleContactPress(item)}>
            <Text style={styles.updateButton}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteContact(item.id)}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchBox}
          placeholder="Search contacts..."
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setFormType('add');
          setModalVisible(true);
        }}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filterContacts()}
        renderItem={({ item }) =>
          item.id === 'no-results-found' ? (
            <Text style={styles.noContactsText}>{item.firstName}</Text>
          ) : (
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleContactPress(item)}
            >
              <View>
                <Text style={styles.contactName}>{item.firstName}</Text>
                <Text style={styles.contactNumber}>
                  {item.phone && item.phone}
                </Text>
              </View>
              <View style={styles.contactActionButtonsContainer}>
                <TouchableOpacity onPress={() => handleContactPress(item)}>
                  <Text style={styles.updateButton}>Update</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteContact(item.id)}>
                  <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )
        }
        keyExtractor={(item) => item.id}
      />
      {contacts.length === 0 && (
        <Text style={styles.noContactsText}>No contacts found.</Text>
      )}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phone}
            onChangeText={(text) => setPhone(text)}
          />
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              setModalVisible(false);
              setSelectedContact(null);
              setFirstName('');
              setLastName('');
              setPhone('');
            }}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => {
              formType === 'add' ? handleAddContact() : handleUpdateContact();
            }}>
              <Text style={styles.modalButtonText}>{formType === 'add' ? 'Add' : 'Update'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  searchBox: {
    flex: 1,
    height: 40,
    marginTop:40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
  },
  addButton: {
    width: 40,
    height: 40,
    marginLeft: 8,
    borderRadius: 20,
    marginTop:40,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactNumber: {
    fontSize: 14,
    color: '#777',
  },
  contactActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  updateButton: {
    color: '#2196F3',
    marginRight: 16,
  },
  deleteButton: {
    color: '#F44336',
  },
  noContactsText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 18,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  input: {
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 32,
  },
  modalButton: {
    width: 100,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
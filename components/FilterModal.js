import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilterModal = ({ visible, onClose, onApplyFilters }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedDistance, setSelectedDistance] = useState('Todos');
  const [selectedRating, setSelectedRating] = useState('Todas');
  
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [distanceDropdownOpen, setDistanceDropdownOpen] = useState(false);
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);

  const typeOptions = ['Todos', 'Clínica Veterinária', 'Petshop'];
  const distanceOptions = ['Todos', 'Até 1km', 'Até 5km', 'Até 10km', 'Mais de 10km'];
  const ratingOptions = ['Todas', '2.0+', '3.0+', '4.0+', '5.0'];

  const handleApply = () => {
    if (selectedDistance && selectedDistance !== 'Todos') {
      Alert.alert(
        'Filtro de distância indisponível',
        'A ferramenta de localização ainda não está disponível. Remova o filtro de distância ou selecione "Todos" para continuar.'
      );
      return;
    }

    onApplyFilters({
      search: searchText,
      type: selectedType,
      distance: selectedDistance,
      rating: selectedRating,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              placeholder="Buscar..."
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={18} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>Filtros</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Tipo</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setTypeDropdownOpen(!typeDropdownOpen);
                  setDistanceDropdownOpen(false);
                  setRatingDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownText}>{selectedType}</Text>
                <Ionicons
                  name={typeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
              {typeDropdownOpen && (
                <View style={styles.dropdownOptions}>
                  {typeOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedType(option);
                        setTypeDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          selectedType === option && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Distância</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setDistanceDropdownOpen(!distanceDropdownOpen);
                  setTypeDropdownOpen(false);
                  setRatingDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownText}>{selectedDistance}</Text>
                <Ionicons
                  name={distanceDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
              {distanceDropdownOpen && (
                <View style={styles.dropdownOptions}>
                  {distanceOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedDistance(option);
                        setDistanceDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          selectedDistance === option && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Avaliação mínima</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => {
                  setRatingDropdownOpen(!ratingDropdownOpen);
                  setTypeDropdownOpen(false);
                  setDistanceDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownText}>{selectedRating}</Text>
                <Ionicons
                  name={ratingDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
              {ratingDropdownOpen && (
                <View style={styles.dropdownOptions}>
                  {ratingOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setSelectedRating(option);
                        setRatingDropdownOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          selectedRating === option && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: '90%',
  },
    searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#FF7A00',
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  filtersContainer: {
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOptionTextSelected: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FF7A00',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FilterModal;


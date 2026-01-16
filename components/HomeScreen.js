import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} 
from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FilterModal from './FilterModal';

const HomeScreen = ({ onLogout, user, onStorePress, stores }) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: 'Todos',
    distance: 'Todos',
    rating: 'Todas',
  });
  
  const initial =
    (user?.fullName || '')
      .trim()
      .charAt(0)
      .toUpperCase() || 'A';

  const activeSearchText = searchText || filters.search || '';
  
  const filteredStores = stores.filter((item) => {
    let match = true;
    
    if (activeSearchText.trim() !== '') {
      const searchLower = activeSearchText.toLowerCase().trim();
      const nameMatch = item.name?.toLowerCase().includes(searchLower);
      const addressMatch = item.address?.toLowerCase().includes(searchLower);
      match = match && (nameMatch || addressMatch);
    }
    
    if (filters.type && filters.type !== 'Todos') {
      const itemTipoNorm = (item.tipo || '').toLowerCase().replace(/\s+/g, '');
      const filterTipoNorm = (filters.type || '').toLowerCase().replace(/\s+/g, '');
      match = match && (itemTipoNorm === filterTipoNorm);
    }
    
    if (filters.rating && filters.rating !== 'Todas') {
     const ratingFilterRaw = filters.rating;
      const ratingItem = parseFloat((item.rating || '').replace(',', '.')) || 0;
      const ratingValue = parseFloat(ratingFilterRaw.replace('+', '').replace(',', '.')) || 0;
      let min = ratingValue;
      let max = ratingValue;

      if (ratingFilterRaw.endsWith('+')) {
        // e.g. '4.0+' -> min = 4.0, max = 4.9999; '5.0+' -> min = 5.0, max = Infinity
        if (ratingValue >= 5) {
          max = Infinity;
        } else {
          max = ratingValue + 0.9999;
        }
      }

      match = match && (ratingItem >= min && ratingItem <= max);
    }
    
    return match;
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
      
        <View style={styles.topBar}>
        
      <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.appName}>Petzim</Text>
          <Text style={styles.locationText}>Quixadá - CE</Text>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={onLogout}>
          <Ionicons name="exit-outline" size={30} color="#000" />
        </TouchableOpacity>

      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionTitle}>Petzim</Text>
        <Text style={styles.sectionSubtitle}>
          Encontre as melhores clínicas veterinárias e petshops em Quixadá
        </Text>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput 
            placeholder="Buscar..." 
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={18} color="#fff" />
          <Text style={styles.filterText}>Filtros</Text>
        </TouchableOpacity>

        <Text style={styles.resultCount}>{filteredStores.length} estabelecimento{filteredStores.length !== 1 ? 's' : ''} encontrado{filteredStores.length !== 1 ? 's' : ''}</Text>

        {filteredStores.map((item, index) => (
          <View key={index} style={styles.card}>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
              onPress={() => onStorePress(item)}
              activeOpacity={0.7}
            >
              
              <View style={styles.cardImagePlaceholder}>
                <Ionicons name="image-outline" size={30} color="#999" />
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>

                <View style={styles.cardRatingRow}>
                  <Ionicons name="star" size={16} color="#FFC107" />
                  <Text style={styles.cardRating}>{item.rating}</Text>
                  <Text style={styles.cardPrice}> • {item.price.split(' ')[0]}</Text>
                </View>

                <Text style={styles.cardAddress}>{item.address}</Text>
                <Text style={styles.cardHours}>{item.hours}</Text>
              </View>
            </TouchableOpacity>

          </View>
        ))}

      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          if (newFilters.search) {
            setSearchText(newFilters.search);
          }
        }}
      />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 40,
    paddingBottom: 15,
    marginTop: 0,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  iconButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  locationText: {
    fontSize: 12,
    color: '#555',
  },

  avatarCircle: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#000',
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
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
  
  filterText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },

  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  cardImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  cardInfo: {
    flex: 1,
  },

  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  cardRating: {
    marginLeft: 4,
    fontSize: 13,
  },
  
  cardPrice: {
    fontSize: 13,
    color: '#666',
  },

  cardAddress: {
    fontSize: 12,
    color: '#666',
  },
  cardHours: {
    fontSize: 12,
    color: '#999',
  },

});

export default HomeScreen;

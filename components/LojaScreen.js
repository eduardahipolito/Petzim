import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LojaScreen = ({ route, navigation, user, onAddReview, onDeleteReview }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const scrollViewRef = useRef(null);
  const { store } = route.params || {};
  
  const storeData = store || {
    name: 'Nome da loja',
    rating: 0,
    reviewsCount: 0,
    price: '-',
    image: null,
    description: '',
    services: [],
    address: '-',
    phone: '-',
    hours: '-',
    reviews: [],
  };

  const [reviews, setReviews] = useState(storeData.reviews || []);

  useEffect(() => {
    setReviews(storeData.reviews || []);
  }, [storeData.reviews]);

  const reviewsCount = reviews.length;
  const avgRating = reviewsCount ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewsCount : 0;

  const initial =
    (user?.fullName || '')
      .trim()
      .charAt(0)
      .toUpperCase() || 'A';

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < rating ? 'star' : 'star-outline'}
          size={16}
          color="#FFC107"
        />
      );
    }
    return stars;
  };

  const handleDeleteReview = (index) => {
    Alert.alert('Excluir avaliação', 'Deseja excluir sua avaliação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const reviewToDelete = reviews[index];
          if (typeof onDeleteReview === 'function') onDeleteReview(storeData.userId, storeData.id, reviewToDelete, index);
          setReviews(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.container}>
        <View style={styles.header}>
        <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#000000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {storeData.name}
          </Text>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.clinicImagePlaceholder}>
          <Ionicons name="image-outline" size={60} color="#999" />
        </View>

        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Ionicons name="star" size={24} color="#FFC107" />
            <Text style={styles.summaryValue}>{reviewsCount ? avgRating.toFixed(1).replace('.', ',') : '-'}</Text>
            <Text style={styles.summaryLabel}>
              {reviewsCount} avaliações
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons name="cash-outline" size={24} color="#15B16F" />
            <Text style={styles.summaryTitle}>Preço</Text>
            <Text style={styles.summaryLabel}>{storeData.price}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.description}>{storeData.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.servicesContainer}>
            {storeData.services?.map((service, index) => (
              <View key={index} style={styles.serviceButton}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de contato</Text>

          <View style={styles.contactItem}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <View style={styles.contactTextContainer}>
              <Text style={styles.contactText}>{storeData.address}</Text>
              <TouchableOpacity 
                style={styles.mapLink}
                onPress={() => {
                  Alert.alert(
                    'Localização',
                    'A funcionalidade de visualização no mapa ainda não está disponível.',
                    [{ text: 'OK', style: 'default' }]
                  );
                }}
              >
                <Ionicons name="paper-plane-outline" size={16} color="#FF7A00" />
                <Text style={styles.mapLinkText}>Ver no mapa</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={20} color="#555" />
            <Text style={styles.contactText}>{storeData.phone}</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.contactText}>{storeData.hours}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              Avaliações ({reviewsCount})
            </Text>
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => {
                setIsReviewing(true);
                setRating(0);
                setComment('');
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            >
              <Text style={styles.rateButtonText}>Avaliar</Text>
            </TouchableOpacity>
          </View>

          {isReviewing && (
            <View style={styles.reviewForm}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {[1,2,3,4,5].map(i => (
                  <TouchableOpacity key={i} onPress={() => setRating(i)} style={{ marginRight: 6 }}>
                    <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={20} color="#FFC107" />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder={'Conte sua experiência...'}
                value={comment}
                onChangeText={setComment}
                multiline
              />
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsReviewing(false);
                    setRating(0);
                    setComment('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => {
                    const newReview = {
                      name: user?.fullName || 'Anônimo',
                      rating,
                      date: new Date().toLocaleDateString('pt-BR'),
                      comment,
                    };
                    if (typeof onAddReview === 'function') onAddReview(storeData.name, newReview);
                    setReviews(prev => [newReview, ...prev]);
                    setIsReviewing(false);
                    setRating(0);
                    setComment('');
                  }}
                >
                  <Text style={styles.submitButtonText}>Enviar sua avaliação</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {reviews.map((review, index) => (
            <View key={index} style={styles.reviewItem}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewAvatarText}>
                  {review.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.reviewContent}>
                <View style={styles.reviewHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{review.name}</Text>
                    <View style={styles.reviewStars}>
                      {renderStars(review.rating)}
                    </View>
                  </View>
                  <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                    {(review.name === (user?.fullName || 'Anônimo')) && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteReview(index)}
                      >
                        <Ionicons name="trash" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            </View>
          ))}
        </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 40,
    paddingBottom: 15,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 10,
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
    paddingBottom: 24,
  },
  clinicImagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF7A00',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceButton: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  serviceText: {
    fontSize: 14,
    color: '#555',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mapLinkText: {
    fontSize: 14,
    color: '#FF7A00',
    marginLeft: 4,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rateButton: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rateButtonText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    marginRight: 8,
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 'auto',
  },
  reviewComment: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  reviewForm: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentInput: {
    minHeight: 80,
    borderColor: '#EDEDED',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    textAlignVertical: 'top'
  },
  submitButton: { 
    backgroundColor: '#FF7A00', 
    padding: 12, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: 'center', 
    elevation: 2,
  },

  submitButtonText: { 
    color: '#fff', 
    fontWeight: '700' 
  },

  cancelButton: { 
    backgroundColor: '#F6F6F6', 
    padding: 12, 
    borderRadius: 8, 
    flex: 1, 
    alignItems: 'center',
    elevation: 2,
    marginRight: 10,
  },

  cancelButtonText: { 
    color: '#333', 
    fontWeight: '600' 
  },

  deleteButton: {
    marginLeft: 4,
    padding: 6,
  },
});

export default LojaScreen;


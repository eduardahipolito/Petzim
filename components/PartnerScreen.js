import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CadastrarLoja from './cadastrarLoja';
import EditarLoja from './EditarLoja';
import AvaliacoesLojaModal from './AvaliacoesLojaModal';
import { ref, onValue, off, remove, update } from 'firebase/database';
import { realtimeDb } from '../firebase';

const PartnerScreen = ({ onLogout, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lojaParaEditar, setLojaParaEditar] = useState(null);
  const [showAvaliacoesModal, setShowAvaliacoesModal] = useState(false);
  const [lojaAvaliacoes, setLojaAvaliacoes] = useState(null);
  
  
  const initial =
    (user?.fullName || '')
      .trim()
      .charAt(0)
      .toUpperCase() || 'A';

  useEffect(() => {
    if (!user || (!user.id && !user.email)) {
      setLoading(false);
      return;
    }
    
    const userId = user.id || (user.email ? user.email.replace(/[.#$[\]]/g, '_') : 'unknown');
    console.log('Buscando estabelecimentos para userId:', userId);
    const estabelecimentosRef = ref(realtimeDb, `estabelecimentos/${userId}`);
    
    const unsubscribe = onValue(estabelecimentosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const estabelecimentosList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setEstabelecimentos(estabelecimentosList);
      } else {
        setEstabelecimentos([]);
      }
      setLoading(false);
    });

    return () => {
      off(estabelecimentosRef);
    };
  }, [user]);

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este estabelecimento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = user?.id || (user?.email ? user.email.replace(/[.#$[\]]/g, '_') : 'unknown');
              const estabelecimentoRef = ref(realtimeDb, `estabelecimentos/${userId}/${id}`);
              await remove(estabelecimentoRef);
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir o estabelecimento.');
            }
          }
        }
      ]
    );
  };

  const calcularMediaAvaliacoes = () => {
    if (estabelecimentos.length === 0) return '0,0';
    let totalMedia = 0;
    let countComAvaliacoes = 0;
    
    estabelecimentos.forEach((est) => {
      const reviews = est.reviews || [];
      if (reviews.length > 0) {
        const media = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
        totalMedia += media;
        countComAvaliacoes++;
      }
    });
    
    if (countComAvaliacoes === 0) return '0,0';
    const mediaGeral = totalMedia / countComAvaliacoes;
    return mediaGeral.toFixed(1).replace('.', ',');
  };

  const totalAvaliacoes = estabelecimentos.reduce((sum, est) => sum + (est.reviewsCount || 0), 0);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
      <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Petzim</Text>
          <Text style={styles.headerSubtitle}>Quixadá - CE</Text>
        </View>

        <TouchableOpacity style={styles.headerIcon} onPress={onLogout}>
          <Ionicons name="exit-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.panelContainer}>
          <Text style={styles.panelTitle}>Olá, {user?.fullName || 'usuário'}!</Text>
          <Text style={styles.panelSubtitle}>
           Gerencie seus estabelecimentos.
          </Text>

          <View style={styles.kpiRow}>
            <View style={[styles.kpiCard, styles.kpiOrange]}>
              <Ionicons name="storefront-outline" size={20} color="#FF7A00" />
              <Text style={styles.kpiNumber}>{estabelecimentos.length}</Text>
              <Text style={styles.kpiLabel}>Estabelecimentos</Text>
            </View>

            <View style={[styles.kpiCard, styles.kpiYellow]}>
              <Ionicons name="star-outline" size={20} color="#FFB300" />
              <Text style={styles.kpiNumber}>{calcularMediaAvaliacoes()}</Text>
              <Text style={styles.kpiLabel}>Avaliação média</Text>
            </View>

            <View style={[styles.kpiCard, styles.kpiGreen]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#15B16F" />
              <Text style={styles.kpiNumber}>{totalAvaliacoes}</Text>
              <Text style={styles.kpiLabel}>Avaliações</Text>
            </View>
          </View>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Meus estabelecimentos</Text>

          {estabelecimentos.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrapper}>
                <Ionicons name="home-outline" size={40} color="#FF7A00" />
              </View>
              <Text style={styles.emptyText}>
                Você ainda não cadastrou nenhum estabelecimento
              </Text>

              <TouchableOpacity style={styles.primaryButton} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.primaryButtonText}>Cadastrar novo estabelecimento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Cadastrar novo estabelecimento</Text>
              </TouchableOpacity>
              
              {estabelecimentos.map((estabelecimento) => (
                <View key={estabelecimento.id} style={styles.estabelecimentoCard}>
                  <View style={styles.estabelecimentoImagePlaceholder}>
                    <Ionicons name="image-outline" size={30} color="#999" />
                  </View>
                  <View style={styles.estabelecimentoInfo}>
                    <View style={styles.estabelecimentoHeader}>
                      <Text style={styles.estabelecimentoNome}>{estabelecimento.nome}</Text>
                      <TouchableOpacity onPress={() => handleDelete(estabelecimento.id)}>
                        <Ionicons name="trash-outline" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.estabelecimentoRating}>
                      <Ionicons name="star" size={16} color="#FFB300" />
                      <Text style={styles.estabelecimentoRatingText}>
                        {estabelecimento.rating ? estabelecimento.rating.toFixed(1).replace('.', ',') : '0,0'}
                      </Text>
                    </View>
                    <View style={styles.estabelecimentoBadge}>
                      <Text style={styles.estabelecimentoBadgeText}>
                        {estabelecimento.tipo === 'Clínica Veterinária' ? 'Clinica' : estabelecimento.tipo}
                      </Text>
                    </View>
                    <Text style={styles.estabelecimentoEndereco}>
                      Endereço: {estabelecimento.endereco}
                    </Text>
                    <Text style={styles.estabelecimentoTelefone}>
                      Telefone: {estabelecimento.telefone}
                    </Text>
                    <View style={styles.estabelecimentoActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setLojaParaEditar(estabelecimento);
                          setShowEditModal(true);
                        }}
                      >
                        <Ionicons name="pencil" size={16} color="#666" />
                        <Text style={styles.actionButtonText}>Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setLojaAvaliacoes(estabelecimento);
                          setShowAvaliacoesModal(true);
                        }}
                      >
                        <Ionicons name="eye-outline" size={16} color="#666" />
                        <Text style={styles.actionButtonText}>
                          Ver avaliações ({estabelecimento.reviewsCount || 0})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
      <CadastrarLoja 
        visible={showModal} 
        onClose={() => setShowModal(false)} 
        user={user}
      />
      <EditarLoja
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        loja={lojaParaEditar}
        user={user}
        onAtualizou={() => setShowEditModal(false)}
      />
      <AvaliacoesLojaModal
        visible={showAvaliacoesModal}
        onClose={() => setShowAvaliacoesModal(false)}
        loja={lojaAvaliacoes}
        onDeleteReview={async (storeId, reviewToDelete, index) => {
          try {
            const userId = user?.id || (user?.email ? user.email.replace(/[.#$[\]]/g, '_') : 'unknown');
            const estabelecimentoRef = ref(realtimeDb, `estabelecimentos/${userId}/${storeId}`);
            const loja = estabelecimentos.find(e => e.id === storeId);

            if (!loja) return;
            const reviewsAtuais = loja.reviews || [];
            let novasReviews = reviewsAtuais.filter(r => !(r.name === reviewToDelete.name && r.date === reviewToDelete.date && r.comment === reviewToDelete.comment && r.rating === reviewToDelete.rating));

            if (novasReviews.length === reviewsAtuais.length && typeof index === 'number') {
              novasReviews = reviewsAtuais.filter((_, i) => i !== index);
            }
            
            const novoReviewsCount = novasReviews.length;
            const somaRatings = novasReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
            const novaMedia = novoReviewsCount ? (somaRatings / novoReviewsCount) : 0;
            await update(estabelecimentoRef, {
              reviews: novasReviews,
              reviewsCount: novoReviewsCount,
              rating: novaMedia,
            });
          } catch (err) {
            console.error('Erro ao deletar avaliação:', err);
            Alert.alert('Erro', 'Não foi possível excluir a avaliação.');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 40,
    paddingBottom: 15,
    marginTop: 0,
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#000',
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
  },
  content: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 24,
  },
  panelContainer: {
    backgroundColor: '#FFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginHorizontal: 0,
    marginBottom: 15,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF7A00',
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  kpiOrange: {
    backgroundColor: '#FFF3E5',
  },
  kpiYellow: {
    backgroundColor: '#FFFBE5',
  },
  kpiGreen: {
    backgroundColor: '#E5FFF4',
    marginRight: 0,
  },
  kpiNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 6,
  },
  kpiLabel: {
    fontSize: 11,
    color: '#000',
    marginTop: 2,
  },
  listContainer: {
    marginTop: 4,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginLeft: 20,
    marginBottom: 18,
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 16,
    paddingVertical: 25,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  emptyIconWrapper: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginBottom: 13,
  },
  primaryButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  estabelecimentoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  estabelecimentoImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  estabelecimentoInfo: {
    flex: 1,
  },
  estabelecimentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  estabelecimentoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  estabelecimentoRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  estabelecimentoRatingText: {
    fontSize: 14,
    color: '#000',
    marginLeft: 4,
  },
  estabelecimentoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  estabelecimentoBadgeText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  estabelecimentoEndereco: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  estabelecimentoTelefone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  estabelecimentoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default PartnerScreen;

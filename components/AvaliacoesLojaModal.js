import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AvaliacoesLojaModal = ({ visible, onClose, loja, onDeleteReview }) => {
  const [filtroEstrela, setFiltroEstrela] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('recentes');

  const [localReviews, setLocalReviews] = useState(loja?.reviews || []);

  React.useEffect(() => {
    setLocalReviews(loja?.reviews || []);
  }, [loja?.reviews]);

  const reviews = localReviews || [];

  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        media: 0,
        total,
        porEstrela: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    const porEstrela = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let soma = 0;
    reviews.forEach((r) => {
      const nota = Number(r.rating) || 0;
      if (nota >= 1 && nota <= 5) {
        porEstrela[nota] += 1;
      }
      soma += nota;
    });
    const media = soma / total || 0;
    return { media, total, porEstrela };
  }, [reviews]);

  const reviewsFiltradas = useMemo(() => {
    let lista = [...reviews];
    if (filtroEstrela !== 'todas') {
      const estrelaNum = Number(filtroEstrela);
      lista = lista.filter((r) => Number(r.rating) === estrelaNum);
    }
    lista.sort((a, b) => {
      const da = a.date || '';
      const db = b.date || '';
      if (ordenacao === 'recentes') {
        return db.localeCompare(da);
      }
      return da.localeCompare(db);
    });
    return lista;
  }, [reviews, filtroEstrela, ordenacao]);

  const handleDelete = (review, index) => {
    Alert.alert('Excluir avaliação', 'Deseja excluir esta avaliação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        setLocalReviews(prev => prev.filter(r => !(r.name === review.name && r.date === review.date && r.comment === review.comment && r.rating === review.rating)));
        if (typeof onDeleteReview === 'function') {
          try {
            await onDeleteReview(loja?.id, review, index);
          } catch (err) {
            console.error('Erro ao chamar onDeleteReview:', err);
            Alert.alert('Erro', 'Não foi possível excluir a avaliação.');
          }
        }
      } }
    ]);
  };

  const formatMedia = (m) =>
    (Number.isFinite(m) ? m : 0).toFixed(1).replace('.', ',');

  const tagTexto =
    stats.media === 0
      ? 'Sem avaliações ainda'
      : stats.media < 3
      ? 'Precisa melhorar'
      : stats.media < 4
      ? 'Bom'
      : 'Excelente';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>

          <Text style={styles.title}>Ver suas avaliações</Text>
          <Text style={styles.subtitle}>
            Avaliações - {loja?.nome || ''}
          </Text>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}>
                <View style={styles.mediaRow}>
                  <Text style={styles.mediaText}>{formatMedia(stats.media)}</Text>
                  <Ionicons name="star" size={20} color="#FFC107" />
                </View>
                <Text style={styles.totalText}>
                  {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
                </Text>
              </View>

              <View style={styles.summaryRight}>
                <Text style={styles.tagText}>{tagTexto}</Text>
              </View>
            </View>

            <View style={styles.barrasContainer}>
              {[5, 4, 3, 2, 1].map((estrela) => {
                const qtd = stats.porEstrela[estrela] || 0;
                const perc = stats.total ? (qtd / stats.total) * 100 : 0;
                return (
                  <View key={estrela} style={styles.barraRow}>
                    <Text style={styles.barraLabel}>{estrela} ★</Text>
                    <View style={styles.barraBackground}>
                      <View style={[styles.barraFill, { width: `${perc}%` }]} />
                    </View>
                    <Text style={styles.barraQtd}>{qtd}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.filtersRow}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() =>
                  setFiltroEstrela((prev) =>
                    prev === 'todas'
                      ? '5'
                      : prev === '5'
                      ? '4'
                      : prev === '4'
                      ? '3'
                      : prev === '3'
                      ? '2'
                      : prev === '2'
                      ? '1'
                      : 'todas'
                  )
                }
              >
                <Text style={styles.filterText}>
                  {filtroEstrela === 'todas'
                    ? 'Todas as estrelas'
                    : `${filtroEstrela} estrelas`}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#555" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() =>
                  setOrdenacao((prev) => (prev === 'recentes' ? 'antigas' : 'recentes'))
                }
              >
                <Text style={styles.filterText}>
                  {ordenacao === 'recentes' ? 'Mais recentes' : 'Mais antigas'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#555" />
              </TouchableOpacity>
            </View>

            {reviewsFiltradas.length === 0 ? (
              <View style={styles.emptyWrapper}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#CCC" />
                <Text style={styles.emptyText}>Nenhuma avaliação ainda</Text>
              </View>
            ) : (
              reviewsFiltradas.map((review, index) => (
                <View key={index} style={styles.reviewItem}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {(review.name || 'A').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.reviewContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>{review.name}</Text>
                        <View style={styles.reviewStars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Ionicons
                              key={i}
                              name={i < (Number(review.rating) || 0) ? 'star' : 'star-outline'}
                              size={14}
                              color="#FFC107"
                            />
                          ))}
                        </View>
                      </View>
                      <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.reviewDate, { marginRight: 8 }]}>{review.date}</Text>
                        {typeof onDeleteReview === 'function' && (
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(review, index)}
                          >
                            <Ionicons name="trash" size={18} color="#FF3B30" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.13)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '92%',
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  closeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    width: 30,
    height: 30,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: '#777',
    marginBottom: 16,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {},
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mediaText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  totalText: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  summaryRight: {},
  tagText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'right',
  },
  barrasContainer: {
    marginTop: 16,
    gap: 6,
  },
  barraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barraLabel: {
    width: 32,
    fontSize: 11,
    color: '#555',
  },
  barraBackground: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  barraFill: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#66BB6A',
  },
  barraQtd: {
    width: 18,
    fontSize: 11,
    textAlign: 'right',
    color: '#555',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
  },
  filterText: {
    fontSize: 12,
    color: '#555',
  },
  emptyWrapper: {
    alignItems: 'center',
    marginTop: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    color: '#777',
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF7A00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    marginBottom: 4,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
  },
  reviewStars: {
    flexDirection: 'row',
    marginRight: 6,
  },

  deleteButton: {
    marginLeft: 8,
    padding: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
    marginLeft: 'auto',
  },
  reviewComment: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
});

export default AvaliacoesLojaModal;



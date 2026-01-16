import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import PartnerScreen from './components/PartnerScreen';
import LojaScreen from './components/LojaScreen';
import { ref, onValue, off, update } from 'firebase/database';
import { realtimeDb } from './firebase';


export default function App() {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const estabelecimentosRef = ref(realtimeDb, 'estabelecimentos');
    
    const unsubscribe = onValue(estabelecimentosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const todasLojas = [];

        Object.keys(data).forEach((userId) => {
          const estabelecimentosUsuario = data[userId];
          if (estabelecimentosUsuario) {

            Object.keys(estabelecimentosUsuario).forEach((estabelecimentoId) => {
              const estabelecimento = estabelecimentosUsuario[estabelecimentoId];

              todasLojas.push({
                id: estabelecimentoId,
                userId: userId,
                name: estabelecimento.nome || '',
                rating: estabelecimento.rating ? estabelecimento.rating.toFixed(1).replace('.', ',') : '0,0',
                reviewsCount: estabelecimento.reviewsCount || 0,
                price: estabelecimento.preco ? (estabelecimento.preco === 'Alto' ? '$$$' : estabelecimento.preco === 'Médio' ? '$$' : '$') : '$$',
                address: estabelecimento.endereco || '',
                phone: estabelecimento.telefone || '',
                hours: estabelecimento.horario || '-',
                description: estabelecimento.descricao || '',
                services: Array.isArray(estabelecimento.servico) ? estabelecimento.servico : (estabelecimento.servico ? [estabelecimento.servico] : []),
                reviews: estabelecimento.reviews || [],
                tipo: estabelecimento.tipo || '',
              });
            });
          }
        });
        setStores(todasLojas);
      } else {
        setStores([]);
      }
    });

    return () => {
      off(estabelecimentosRef);
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home');
    setSelectedStore(null);
  };

  const handleStorePress = (store) => {
    setSelectedStore(store);
    setCurrentScreen('loja');
  };


  const handleAddReview = async (storeName, review) => {

    const loja = stores.find(s => s.name === storeName);
    if (!loja || !loja.userId || !loja.id) return;

    try {
      const estabelecimentoRef = ref(realtimeDb, `estabelecimentos/${loja.userId}/${loja.id}`);
      const reviewsAtuais = loja.reviews || [];
      const novasReviews = [review, ...reviewsAtuais];
      const novoReviewsCount = novasReviews.length;
      

      const somaRatings = novasReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
      const novaMedia = somaRatings / novoReviewsCount;

      await update(estabelecimentoRef, {
        reviews: novasReviews,
        reviewsCount: novoReviewsCount,
        rating: novaMedia,
      });
    } catch (error) {
      console.error('Erro ao adicionar avaliação:', error);
    }
  };

  const handleDeleteReview = async (userId, storeId, reviewToDelete, index) => {
    const loja = stores.find(s => s.userId === userId && s.id === storeId);
    if (!loja || !loja.userId || !loja.id) return;

    try {
      const estabelecimentoRef = ref(realtimeDb, `estabelecimentos/${loja.userId}/${loja.id}`);
      const reviewsAtuais = loja.reviews || [];

      // Try to remove by matching the review object first (safer when indices might differ)
      let novasReviews = reviewsAtuais.filter(r => !(r.name === reviewToDelete.name && r.date === reviewToDelete.date && r.comment === reviewToDelete.comment && r.rating === reviewToDelete.rating));

      // If nothing was removed (e.g., matching failed), try removing by provided index
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
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
    }
  };

  const handleGoBack = () => {
    setCurrentScreen('home');
    setSelectedStore(null);
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  if (user?.type === 'Tutor') {
    if (currentScreen === 'loja') {
      return (
        <LojaScreen
          route={{ params: { store: stores.find(s => s.id === selectedStore?.id) || selectedStore } }}
          navigation={{ goBack: handleGoBack }}
          onAddReview={(storeName, review) => handleAddReview(storeName, review)}
          onDeleteReview={(userId, storeId, review, index) => handleDeleteReview(userId, storeId, review, index)}
          stores={stores}
          user={user}
        />
      );
    }
    return (
      <HomeScreen
        onLogout={handleLogout}
        user={user}
        onStorePress={handleStorePress}
        stores={stores}
      />
    );
  }

  if (user?.type === 'Parceiro') {
    return (
      <PartnerScreen 
        onLogout={handleLogout} 
        user={user} 
      />
    );
  }

  return null;
}

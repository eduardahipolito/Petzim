import React, { useState, useEffect } from 'react';
import { TextInputMask } from 'react-native-masked-text';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update } from 'firebase/database';
import { realtimeDb } from '../firebase';

const tipos = ['Petshop', 'Clínica'];
const precos = ['Baixo', 'Médio', 'Alto'];
const servicos = ['Banho', 'Tosa', 'Veterinário', 'Vacinação'];

const EditarLoja = ({ visible, onClose, loja, user, onAtualizou }) => {
  const [nome, setNome] = useState(loja?.nome || '');
  const [tipo, setTipo] = useState(loja?.tipo === 'Clínica Veterinária' ? 'Clínica' : loja?.tipo || '');
  const [endereco, setEndereco] = useState(loja?.endereco || '');
  const [horario, setHorario] = useState(loja?.horario || '');
  const [telefone, setTelefone] = useState(loja?.telefone || '');
  const [descricao, setDescricao] = useState(loja?.descricao || '');
  const [preco, setPreco] = useState(loja?.preco || '');
  const [servicosSelecionados, setServicosSelecionados] = useState(Array.isArray(loja?.servico) ? loja?.servico : []);

  useEffect(() => {
    if (visible) {
      setNome(loja?.nome || '');
      setTipo(loja?.tipo === 'Clínica Veterinária' ? 'Clínica' : loja?.tipo || '');
      setEndereco(loja?.endereco || '');
      setHorario(loja?.horario || '');
      setTelefone(loja?.telefone || '');
      setDescricao(loja?.descricao || '');
      setPreco(loja?.preco || '');
      setServicosSelecionados(Array.isArray(loja?.servico) ? loja?.servico : []);
    }
  }, [visible, loja]);

  const handleSalvar = async () => {
    if (!nome || !tipo || !endereco || !telefone) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    try {
      const userId = user?.id || user?.userId || (user?.email ? user.email.replace(/[.#$[\]]/g, '_') : 'unknown');
      const estabelecimentoRef = ref(realtimeDb, `estabelecimentos/${userId}/${loja.id}`);
      await update(estabelecimentoRef, {
        nome,
        tipo: tipo === 'Clínica' ? 'Clínica Veterinária' : tipo,
        endereco,
        horario,
        telefone,
        descricao,
        preco,
        servico: servicosSelecionados,
      });
      Alert.alert('Sucesso', 'Estabelecimento atualizado com sucesso!');
      onAtualizou?.();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar. Tente novamente.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Editar estabelecimento</Text>
            <Text style={styles.label}>Nome do estabelecimento*</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Digite o nome" placeholderTextColor="#999" />
            <Text style={styles.label}>Tipo*</Text>
            <View style={styles.pickerWrapperRow}>
              {tipos.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tipoOption, tipo === item ? styles.tipoSelecionado : null]}
                  onPress={() => setTipo(item)}
                >
                  <Text style={{ color: tipo === item ? '#fff' : '#232' }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Endereço*</Text>
            <TextInput style={styles.input} value={endereco} onChangeText={setEndereco} placeholder="Digite o endereço" placeholderTextColor="#999" />

            <Text style={styles.label}>Horário de funcionamento</Text>
            <TextInput
              style={styles.input}
              value={horario}
              onChangeText={setHorario}
              placeholder="Ex: Seg a Sex: 08:00 às 18:00, Sáb: 09:00 às 13:00"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Telefone*</Text>
            <TextInputMask
              style={styles.input}
              type={'cel-phone'}
              options={{ maskType: 'BRL', withDDD: true, dddMask: '(99) ' }}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, { height: 65, textAlignVertical: 'top' }]} multiline value={descricao} onChangeText={setDescricao} placeholder="Descreva brevemente" placeholderTextColor="#999" />
            <Text style={styles.label}>Faixa de preço</Text>
            <View style={styles.pickerWrapperRow}>
              {precos.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.tipoOption, preco === item ? styles.tipoSelecionado : null]}
                  onPress={() => setPreco(item)}
                >
                  <Text style={{ color: preco === item ? '#fff' : '#232' }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Serviços oferecidos</Text>
            <View style={{ marginBottom: 10 }}>
              {servicos.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                  onPress={() => {
                    setServicosSelecionados((prev) => {
                      if (prev.includes(item)) {
                        return prev.filter(s => s !== item);
                      } else {
                        return [...prev, item];
                      }
                    });
                  }}
                >
                  <View style={{
                    width: 18,
                    height: 18,
                    borderWidth: 1,
                    borderColor: '#aaa',
                    borderRadius: 4,
                    backgroundColor: servicosSelecionados.includes(item) ? '#FF7A00' : '#fff',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8
                  }}>
                    {servicosSelecionados.includes(item) && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={{ fontSize: 14, color: '#252525' }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cadastrarButton} onPress={handleSalvar}>
                <Text style={styles.cadastrarText}>Salvar alterações</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#333',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 15,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 18,
    top: 18,
    zIndex: 5,
    padding: 4,
  },
  title: {
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 16,
    marginBottom: 18,
    color: '#333',
  },
  label: {
    fontWeight: '500',
    fontSize: 13,
    color: '#252525',
    marginTop: 7,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9e9e9',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 6,
    height: 38,
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 21,
    gap: 8,
  },
  cadastrarButton: {
    flex: 1,
    backgroundColor: '#FF7A00',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  cadastrarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#DCDCDC',
    marginLeft: 10,
  },
  cancelText: {
    color: '#232322',
    fontWeight: '600',
    fontSize: 16,
  },
  pickerWrapperRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 7,
  },
  tipoOption: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9e9e9',
    marginRight: 7,
    marginBottom: 4,
  },
  tipoSelecionado: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
});

export default EditarLoja;


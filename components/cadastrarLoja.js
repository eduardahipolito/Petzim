import React, { useState, useEffect } from 'react';
import { TextInputMask } from 'react-native-masked-text';
import { Picker } from '@react-native-picker/picker';
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
import { ref, push, set } from 'firebase/database';
import { realtimeDb } from '../firebase';

const tipos = ['Petshop', 'Clínica', 'Hotel', 'Outro'];
const precos = ['Baixo', 'Médio', 'Alto'];
const servicos = ['Banho', 'Tosa', 'Veterinário', 'Vacinação'];

const CadastrarLoja = ({ visible, onClose, onSubmit, user }) => {
  
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [descricao, setDescricao] = useState('');
const [preco, setPreco] = useState('');
const [servicosSelecionados, setServicosSelecionados] = useState([]);
const [horario, setHorario] = useState('');

  const limparCampos = () => {
    setNome('');
    setTipo('');
    setEndereco('');
    setTelefone('');
    setDescricao('');
    setPreco('');
    setServicosSelecionados([]);
    setHorario('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color="#333" />
          </TouchableOpacity>

          <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Cadastrar estabelecimento</Text>
            <Text style={styles.label}>Nome do estabelecimento*</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Digite o nome" placeholderTextColor="#999" />
            <Text style={styles.label}>Tipo*</Text>
            <View style={styles.pickerWrapper}>
              <View style={styles.pickerDisplay}>
                <Text style={[styles.pickerText, !tipo && styles.pickerPlaceholder]}>
                  {tipo === 'Petshop' ? 'Petshop' : tipo === 'Clínica' ? 'Clínica Veterinária' : 'Selecione o tipo'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666" style={styles.pickerIcon} />
              </View>
              <Picker
                selectedValue={tipo}
                onValueChange={setTipo}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Selecione o tipo" value="" />
                <Picker.Item label="Petshop" value="Petshop" />
                <Picker.Item label="Clínica Veterinária" value="Clínica" />
              </Picker>
            </View>
            <Text style={styles.label}>Endereço*</Text>
            <TextInput style={styles.input} value={endereco} onChangeText={setEndereco} placeholder="Digite o endereço" placeholderTextColor="#999" />

            <Text style={styles.label}>Horário de funcionamento</Text>
            <TextInput
              style={styles.input}
              value={horario}
              onChangeText={setHorario}
              placeholder="Ex: Seg a Sex: 08:00 às 18:00, Sáb: 09:00..."
              placeholderTextColor="#999"
            />
            <Text style={styles.label}>Telefone*</Text>
            <TextInputMask
              style={styles.input}
              type={'cel-phone'}
              options={{
                maskType: 'BRL',
                withDDD: true,
                dddMask: '(99) '
              }}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>Descrição</Text>
            <TextInput style={[styles.input, { height: 65, textAlignVertical: 'top' }]} multiline value={descricao} onChangeText={setDescricao} placeholder="Descreva brevemente" placeholderTextColor="#999" />
            <Text style={styles.label}>Faixa de preço</Text>
            <View style={styles.pickerWrapper}>
              <View style={styles.pickerDisplay}>
                <Text style={[styles.pickerText, !preco && styles.pickerPlaceholder]}>
                  {preco || 'Selecione a faixa'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666" style={styles.pickerIcon} />
              </View>
              <Picker
                selectedValue={preco}
                onValueChange={setPreco}
                style={styles.picker}
              >
                <Picker.Item label="Selecione a faixa" value="" />
                <Picker.Item label="Baixo" value="Baixo" />
                <Picker.Item label="Médio" value="Médio" />
                <Picker.Item label="Alto" value="Alto" />
              </Picker>
            </View>
            <Text style={styles.label}>Serviços oferecidos</Text>
            <View style={{ marginBottom: 10 }}>
              {servicos.map((item) => (
                <TouchableOpacity 
                  key={item}
                  style={{
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    marginBottom: 5,
                  }} 
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
              <TouchableOpacity 
                style={styles.cadastrarButton} 
                onPress={async () => {
                  if (!nome || !tipo || !endereco || !telefone) {
                    Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
                    return;
                  }
                  
                  try {
                    const userId = user?.id || 
                                   (user?.email ? user.email.replace(/[.#$[\]]/g, '_') : null) ||
                                   (user?.fullName ? user.fullName.replace(/[.#$[\]]/g, '_').toLowerCase().replace(/\s+/g, '_') : null) ||
                                   `user_${Date.now()}`;
                    
                    const estabelecimentoData = {
                      nome,
                      tipo: tipo === 'Clínica' ? 'Clínica Veterinária' : tipo,
                      endereco,
                      telefone,
                      descricao: descricao || '',
                      preco: preco || '',
                      servico: servicosSelecionados.length > 0 ? servicosSelecionados : [],
                      horario: horario || '',
                      userId: userId,
                      rating: 0,
                      reviewsCount: 0,
                      reviews: [],
                      createdAt: new Date().toISOString(),
                    };
                    
                    const estabelecimentosRef = ref(realtimeDb, `estabelecimentos/${userId}`);
                    const newEstabelecimentoRef = push(estabelecimentosRef);
                    await set(newEstabelecimentoRef, estabelecimentoData);
                    
                    Alert.alert('Sucesso', 'Estabelecimento cadastrado com sucesso!');
                    limparCampos();
                    onClose();
                    onSubmit?.(estabelecimentoData);
                  } catch (error) {
                    console.error('Erro ao cadastrar:', error);
                    Alert.alert('Erro', 'Não foi possível cadastrar. Verifique sua conexão e tente novamente.');
                  }
                }}
              >
                <Text style={styles.cadastrarText}>Cadastrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {limparCampos(); onClose();}}>
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e9e9e9',
    borderRadius: 10,
    marginBottom: 6,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    height: 38,
    position: 'relative',
  },
  pickerDisplay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    zIndex: 1,
    pointerEvents: 'none',
  },
  pickerText: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },
  pickerPlaceholder: {
    color: '#999',
  },
  pickerIcon: {
    marginLeft: 8,
  },
  picker: {
    color: 'transparent',
    height: 38,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  pickerItem: {
    fontSize: 14,
    color: '#222',
  },
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
});

export default CadastrarLoja;


import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Platform, 
  KeyboardAvoidingView, 
  Alert, 
} from 'react-native';

import { realtimeDb } from '../firebase';
import { ref, set, get } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

import petzimLogoImage from '../assets/logo-petzim.png'; 

const { height } = Dimensions.get('window');

//para iniciar na tela de login 
const LoginScreen = ({ onLogin, onCadastro }) => {
  const [activeTab, setActiveTab] = useState('Entrar'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('');

  const handleAction = () => {
    const trimmedEmail = email.trim();

    if (activeTab === 'Entrar') {
      if (!trimmedEmail || !password) {
        alert('Por favor, preencha o e-mail e a senha para entrar.');
        return;
      }

      const safeEmailKey = trimmedEmail.replace(/[.#$[\]]/g, '_');
      const userRef = ref(realtimeDb, 'users/' + safeEmailKey);

      get(userRef)
        .then((snapshot) => {
          if (!snapshot.exists()) {
            alert('Usuário não encontrado. Verifique o e-mail ou faça o cadastro.');
            return;
          }
          const data = snapshot.val();
          if (data.password !== password) {
            alert('Senha incorreta.');
            return;
          }

          const userType = data.accountType || '';
          onLogin({
            type: userType,
            fullName: data.fullName || '',
            email: trimmedEmail,
            id: safeEmailKey,
          });
        })
        .catch((error) => {
          console.log('Erro ao buscar usuário no Realtime Database:', error);
          alert('Não foi possível realizar o login. Tente novamente.');
        });
    } else {
      if (!fullName.trim() || !trimmedEmail || !password || !accountType) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        alert('Formato de e-mail inválido.');
        return;
      }
  
      if (password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        return;
      }
  
      const safeEmailKey = trimmedEmail.replace(/[.#$[\]]/g, '_');
      const userRef = ref(realtimeDb, 'users/' + safeEmailKey);
  
      const userData = {
        fullName: fullName.trim(),
        email: trimmedEmail,
        password, 
        accountType,
      };
  
      set(userRef, userData)
        .then(() => {
          alert('Cadastro realizado com sucesso! Faça seu login.');
          setActiveTab('Entrar');
          setFullName('');
          setEmail('');
          setPassword('');
          setAccountType('Parceiro');
        })
        .catch((error) => {
          console.log('Erro ao salvar no Realtime Database:', error);
          alert('Erro ao salvar os dados no Realtime Database: ' + (error.message || 'Tente novamente.'));
        });
    }
  };


  const RadioOption = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity
      style={styles.radioContainer}
      onPress={() => onSelect(value)}
    >
      <View style={styles.radioCircle}>
        {value === selectedValue && <View style={styles.radioChecked} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

//tela de cadastro
  const renderCadastroForm = () => (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Nome completo"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.typeTitle}>Tipo de conta</Text>
      
      <RadioOption
        label="Tutor de pet"
        value="Tutor"
        selectedValue={accountType}
        onSelect={setAccountType}
      />

      <RadioOption
        label="Parceiro (Clínica/Petshop)"
        value="Parceiro"
        selectedValue={accountType}
        onSelect={setAccountType}
      />
      
    </View>
  );
  
//tela de login
  const renderLoginForm = () => (
    <View>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="emailAddress"
      />
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={22}
            color="#999"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.fullScreen} 
      keyboardVerticalOffset={0} 
    >
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.logoContainer}>
          <Image 
            source={petzimLogoImage} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Bem-Vindo ao Petzim</Text>
          <Text style={styles.subtitleText}>
            Entre ou cadastre-se para acessar o sistema
          </Text>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'Entrar' ? styles.activeTabButton : styles.inactiveTabButton
              ]}
              onPress={() => setActiveTab('Entrar')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'Entrar' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                Entrar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'Cadastrar' ? styles.activeTabButton : styles.inactiveTabButton
              ]}
              onPress={() => setActiveTab('Cadastrar')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'Cadastrar' ? styles.activeTabText : styles.inactiveTabText
              ]}>
                Cadastrar
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'Entrar' ? renderLoginForm() : renderCadastroForm()}
          
          <TouchableOpacity style={styles.mainButton} onPress={handleAction}>
            <Text style={styles.mainButtonText}>
              {activeTab === 'Entrar' ? 'Entrar' : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          {activeTab === 'Entrar' && (
            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => Alert.alert('Tela em desenvolvimento', 'A função de recuperação de senha ainda está em desenvolvimento.')}
            >
              <Text style={styles.forgotPasswordText}>
                Esqueci a senha
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

//tela de login
const styles = StyleSheet.create({
  fullScreen: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  container: { 
    flexGrow: 1, 
    backgroundColor: '#FFFFFF' 
  },
  logoContainer: {
    backgroundColor: '#F7E7DA', 
    height: height * 0.35, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { 
    width: 300, 
    height: 300 
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 50,
    marginTop: -20, 
    zIndex: 1, 
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitleText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0', 
    borderRadius: 8,
    marginBottom: 30,
    padding: 3,
  },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  activeTabButton: {
    backgroundColor: 'white', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2, 
  },
  inactiveTabButton: { backgroundColor: 'transparent' },
  tabText: { fontSize: 16, fontWeight: '600' },
  activeTabText: { color: '#FF7A00' },
  inactiveTabText: { color: '#666' },
  
  input: {
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15, 
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  
//tela de cadastro
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioChecked: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF7A00', 
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
  },

  mainButton: {
    backgroundColor: '#FF7A00', 
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#FF7A00', 
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
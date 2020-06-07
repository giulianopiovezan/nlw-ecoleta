import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { StyleSheet, View, Image, Text, ImageBackground } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

import Select from 'react-native-picker-select';

import axios from 'axios';

interface StateResponse {
  sigla: string;
}

interface CityResponse {
  nome: string;
}

interface SelectProps {
  label: string;
  value: string;
}

const Home: React.FC = () => {
  const [states, setStates] = useState<SelectProps[]>([]);
  const [cities, setCities] = useState<SelectProps[]>([]);
  const [selectedState, setSelectedState] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const navigation = useNavigation();

  const enableEnter = selectedState !== '0' && selectedCity !== '0';

  useEffect(() => {
    axios.get<StateResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => {
        const transformedValues = res.data.map(state => ({ 
          label: state.sigla,
          value: state.sigla, 
        }));
        setStates(transformedValues);
      });
  }, []);

  useEffect(() => {
    if(selectedState === '0'){
      return;
    }

    axios.get<CityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
      .then(res => {
        const cityNames = res.data.map(city => ({
          label: city.nome,
          value: city.nome
        }));
        setCities(cityNames);
      });
  }, [selectedState]);
  

  function handleNavigateToPoints(){
    navigation.navigate('Points', { uf: selectedState, city: selectedCity });
  }

  function handleSelectState(value: string){
    setSelectedState(value);
    setSelectedCity('0');
  }

  function handleSelectCity(value: string){
    setSelectedCity(value);
  }

  return (
    <ImageBackground 
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>
          Seu marketplace de coleta de resíduos
        </Text>
        <Text style={styles.description}>
          Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente
        </Text>

      </View>

      <View style={styles.footer}>

        <Select 
          style={{
            inputAndroid: styles.select,
            inputIOS: styles.select,
          }}
          placeholder={{
            label: 'Selecione uma UF',
            value: '0'
          }}
          items={states}
          onValueChange={handleSelectState}
        />

        <Select 
          style={{
            inputAndroid: styles.select,
            inputIOS: styles.select,
          }}
          placeholder={{
            label: 'Selecione uma Cidade',
            value: '0'
          }}
          items={cities}
          onValueChange={handleSelectCity}
        />

        <RectButton 
          style={[styles.button, !enableEnter && styles.buttonDisabled]} 
          onPress={handleNavigateToPoints}
          enabled={enableEnter}
        >
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#FFF" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  buttonDisabled: {
    backgroundColor: '#DADADA'
  }
});

export default Home;
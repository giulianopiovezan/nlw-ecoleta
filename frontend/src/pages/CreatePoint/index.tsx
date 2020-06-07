import React, { useEffect, useState } from 'react';

import { Link, useHistory } from 'react-router-dom';

import { FiArrowLeft } from 'react-icons/fi';

import { Map, TileLayer, Marker } from 'react-leaflet';

import { LeafletMouseEvent } from 'leaflet';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';

import api from '../../services/api';

import axios from 'axios';

interface Items {
  id: number;
  title: string;
  image_url: string;
  selected?: boolean;
}

interface StateResponse {
  sigla: string;
}

interface CityResponse {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const history = useHistory();
  const [items, setItems] = useState<Items[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setInitialPosition([latitude, longitude]);
    })
  }, []);

  useEffect(() => {
    api.get('items').then(res => setItems(res.data));
  }, []);

  useEffect(() => {
    axios.get<StateResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => {
        const acronyms = res.data.map(state => state.sigla);
        setStates(acronyms);
      });
  }, [])

  useEffect(() => {
    if(selectedState === '0'){
      return;
    }

    axios.get<CityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
      .then(res => {
        const cityNames = res.data.map(city => city.nome);
        setCities(cityNames);
      });
  }, [selectedState])

  function handleSelectState(event : React.ChangeEvent<HTMLSelectElement>){
    setSelectedState(event.target.value);
  }

  function handleSelectCity(event : React.ChangeEvent<HTMLSelectElement>){
    setSelectedCity(event.target.value);
  }

  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng,
    ]);
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>){
    const { name, value } = event.target;

    setFormData(prevState => ({...prevState, [name]: value}));
  }

  function handleSelectItem(id: number){
    const selectedItem = items.find(item => item.id === id);

    if(selectedItem){
      selectedItem.selected = !selectedItem.selected;
      setItems([...items.filter(item => item.id !== id), selectedItem]);
    }

  }

  async function handleSubmit(event: React.FormEvent){
    event.preventDefault();
    const itemsId = items.filter(item => item.selected).map(item => item.id);
    const { name, email, whatsapp } = formData;
    const [latitude, longitude] = selectedPosition;
    const city = selectedCity;
    const uf = selectedState;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('city', city);
    data.append('uf', uf);
    data.append('items', itemsId.join(','));

    if(selectedFile){
      data.append('image', selectedFile);
    } 

    await api.post('points', data);

    alert('Ponto de coleta cadastrado!');

    history.push('');
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logo"/>

        <Link to="">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input 
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="name">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="name">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereco</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer 
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select 
                name="uf"
                id="uf"
                value={selectedState}
                onChange={handleSelectState}
              >
                <option value="0">Selecione uma UF</option>
                {
                  states.map(state => <option key={state} value={state}>{state}</option>)
                }
              </select>
            </div>

            <div className="field">
              <label htmlFor="name">Cidade</label>
              <select 
                name="cidade"
                id="cidade"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {
                  cities.map(city => <option key={city} value={city}>{city}</option>)
                }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {
              items.sort((a, b) => a.title.localeCompare(b.title)).map(item => (
                <li key={item.id} onClick={() => handleSelectItem(item.id)} className={item.selected ? 'selected' : ''}>
                  <img src={item.image_url} alt={item.title}/>
                  <span>{item.title}</span>
                </li>
              ))
            }
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;
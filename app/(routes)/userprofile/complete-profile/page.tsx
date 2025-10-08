'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../../sass/userprofile/complete-profile.module.scss';
import { MdCloudUpload, MdPerson, MdEmail, MdPhone, MdLocationOn, MdMyLocation } from 'react-icons/md';
import { FiCalendar, FiUser, FiCheck, FiMapPin } from 'react-icons/fi';
import axios from 'axios';
import * as jwt_decode from "jwt-decode";
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

interface FormData {
  role: string;
  servicesOffered: string[];
}

// Countries data
const countries = [
  { value: 'nigeria', label: 'Nigeria', code: 'NG' },
  { value: 'ghana', label: 'Ghana', code: 'GH' },
  { value: 'kenya', label: 'Kenya', code: 'KE' },
  { value: 'south-africa', label: 'South Africa', code: 'ZA' },
  { value: 'united-states', label: 'United States', code: 'US' },
  { value: 'united-kingdom', label: 'United Kingdom', code: 'GB' },
  { value: 'canada', label: 'Canada', code: 'CA' },
  { value: 'australia', label: 'Australia', code: 'AU' },
  { value: 'germany', label: 'Germany', code: 'DE' },
  { value: 'france', label: 'France', code: 'FR' },
  { value: 'italy', label: 'Italy', code: 'IT' },
  { value: 'spain', label: 'Spain', code: 'ES' },
  { value: 'netherlands', label: 'Netherlands', code: 'NL' },
  { value: 'sweden', label: 'Sweden', code: 'SE' },
  { value: 'norway', label: 'Norway', code: 'NO' },
  { value: 'denmark', label: 'Denmark', code: 'DK' },
  { value: 'finland', label: 'Finland', code: 'FI' },
  { value: 'japan', label: 'Japan', code: 'JP' },
  { value: 'china', label: 'China', code: 'CN' },
  { value: 'india', label: 'India', code: 'IN' },
  { value: 'brazil', label: 'Brazil', code: 'BR' },
  { value: 'mexico', label: 'Mexico', code: 'MX' },
  { value: 'argentina', label: 'Argentina', code: 'AR' },
  { value: 'chile', label: 'Chile', code: 'CL' },
  { value: 'other', label: 'Other', code: 'XX' }
];

// Nigerian States and LGAs data
const nigerianStates = [
  { value: 'abia', label: 'Abia', lgas: ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'] },
  { value: 'adamawa', label: 'Adamawa', lgas: ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'] },
  { value: 'akwa-ibom', label: 'Akwa Ibom', lgas: ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong Oruko', 'Uyo'] },
  { value: 'anambra', label: 'Anambra', lgas: ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'] },
  { value: 'bauchi', label: 'Bauchi', lgas: ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas-Gadau', 'Jama are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'] },
  { value: 'bayelsa', label: 'Bayelsa', lgas: ['Brass', 'Ekeremor', 'Kolokuma Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'] },
  { value: 'benue', label: 'Benue', lgas: ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'] },
  { value: 'borno', label: 'Borno', lgas: ['Abadam', 'Askira-Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala-Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'] },
  { value: 'cross-river', label: 'Cross River', lgas: ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala'] },
  { value: 'delta', label: 'Delta', lgas: ['Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'] },
  { value: 'ebonyi', label: 'Ebonyi', lgas: ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'] },
  { value: 'edo', label: 'Edo', lgas: ['Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Oovia', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'] },
  { value: 'ekiti', label: 'Ekiti', lgas: ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun-Ifelodun', 'Ise-Orun', 'Moba', 'Oye'] },
  { value: 'enugu', label: 'Enugu', lgas: ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti', 'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'] },
  { value: 'fct', label: 'Federal Capital Territory', lgas: ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Municipal Area Council', 'Kwali'] },
  { value: 'gombe', label: 'Gombe', lgas: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu-Deba'] },
  { value: 'imo', label: 'Imo', lgas: ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte-Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji-Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo'] },
  { value: 'jigawa', label: 'Jigawa', lgas: ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kazaure', 'Kiri Kasama', 'Kiyawa', 'Kaugama', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'] },
  { value: 'kaduna', label: 'Kaduna', lgas: ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema a', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'] },
  { value: 'kano', label: 'Kano', lgas: ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'] },
  { value: 'katsina', label: 'Katsina', lgas: ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume', 'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', 'Mai Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'] },
  { value: 'kebbi', label: 'Kebbi', lgas: ['Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko Besse', 'Maiyama', 'Ngaski', 'Sakaba', 'Shanga', 'Suru', 'Wasagu Danko', 'Yauri', 'Zuru'] },
  { value: 'kogi', label: 'Kogi', lgas: ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu', 'Ijumu', 'Kabba Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'] },
  { value: 'kwara', label: 'Kwara', lgas: ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'] },
  { value: 'lagos', label: 'Lagos', lgas: ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'] },
  { value: 'nasarawa', label: 'Nasarawa', lgas: ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'] },
  { value: 'niger', label: 'Niger', lgas: ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'] },
  { value: 'ogun', label: 'Ogun', lgas: ['Abeokuta North', 'Abeokuta South', 'Ado-Odo Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode', 'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'] },
  { value: 'ondo', label: 'Ondo', lgas: ['Akoko North-East', 'Akoko North-West', 'Akoko South-West', 'Akoko South-East', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji-Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'] },
  { value: 'osun', label: 'Osun', lgas: ['Atakunmosa East', 'Atakunmosa West', 'Aiyedaade', 'Aiyedire', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'] },
  { value: 'oyo', label: 'Oyo', lgas: ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomoso North', 'Ogbomoso South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire', 'Oyo', 'Oyo East', 'Saki East', 'Saki West', 'Surulere'] },
  { value: 'plateau', label: 'Plateau', lgas: ['Barkin Ladi', 'Bassa', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', 'Qua an Pan', 'Riyom', 'Shendam', 'Wase'] },
  { value: 'rivers', label: 'Rivers', lgas: ['Abua-Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio-Akpor', 'Ogba-Egbema-Ndoni', 'Ogu-Bolo', 'Okrika', 'Omuma', 'Opobo-Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'] },
  { value: 'sokoto', label: 'Sokoto', lgas: ['Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'] },
  { value: 'taraba', label: 'Taraba', lgas: ['Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'] },
  { value: 'yobe', label: 'Yobe', lgas: ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'] },
  { value: 'zamfara', label: 'Zamfara', lgas: ['Anka', 'Bakura', 'Birnin Magaji Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi'] }
];

// Simple NIN validation (11 digits only)
const validateNIN = (nin: string): { isValid: boolean; error: string } => {
  // Basic format check - only require 11 digits
  if (!/^\d{11}$/.test(nin)) {
    return { isValid: false, error: 'NIN must be exactly 11 digits' };
  }

  return { isValid: true, error: '' };
};
const CreateProfile = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    firstname: string;
    lastname: string;
    email: string;
    birthdate: string;
    nin: string;
    phone: string;
    location: string;
    country: string;
    gender: string;
    role: string;
    servicesOffered: string[];
  }>({
    firstname: '',
    lastname: '',
    email: '',
    birthdate: '',
    nin: '',
    phone: '',
    location: '',
    country: '',
    gender: '',
    role: '',
    servicesOffered: [],
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  
  // New state variables for enhanced validation
  const [ninError, setNinError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const [selectedLga, setSelectedLga] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const router = useRouter();

  // Simple NIN validation handler
  const handleNinChange = (value: string) => {
    setFormData(prev => ({ ...prev, nin: value }));
    
    if (value) {
      const validation = validateNIN(value);
      if (!validation.isValid) {
        setNinError(validation.error);
      } else {
        setNinError('');
      }
    } else {
      setNinError('');
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        
        // Update form data with coordinates
        setFormData(prev => ({
          ...prev,
          location: `${latitude}, ${longitude}`
        }));
        
        setIsLoadingLocation(false);
        setLocationPermissionDenied(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermissionDenied(true);
        setIsLoadingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access was denied. Please select your state and LGA manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable. Please select your state and LGA manually.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out. Please select your state and LGA manually.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle country selection
  const handleCountryChange = (selectedOption: any) => {
    setSelectedCountry(selectedOption);
    setSelectedState(null); // Reset state when country changes
    setSelectedLga(null); // Reset LGA when country changes
    
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        country: selectedOption.value,
        location: selectedOption.label,
        nin: selectedOption.value !== 'nigeria' ? '' : prev.nin // Clear NIN if not Nigeria
      }));
      
      // Clear NIN error if switching away from Nigeria
      if (selectedOption.value !== 'nigeria') {
        setNinError('');
      }
    }
  };

  // Handle state selection (only for Nigeria)
  const handleStateChange = (selectedOption: any) => {
    setSelectedState(selectedOption);
    setSelectedLga(null); // Reset LGA when state changes
    
    if (selectedOption && selectedCountry) {
      setFormData(prev => ({
        ...prev,
        location: `${selectedOption.label}, ${selectedCountry.label}`
      }));
    }
  };

  // Handle LGA selection (only for Nigeria)
  const handleLgaChange = (selectedOption: any) => {
    setSelectedLga(selectedOption);
    
    if (selectedOption && selectedState && selectedCountry) {
      setFormData(prev => ({
        ...prev,
        location: `${selectedOption.label}, ${selectedState.label}, ${selectedCountry.label}`
      }));
    }
  };

  // Fetch the user data 
   useEffect(() => {
  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");
    console.log("Token:", token); 
    if (token) {
      const decodedUser = jwt_decode.jwtDecode(token);
      console.log("Decoded user:", decodedUser);  
      try {
        const response = await axios.get(
          `${baseUrl}/profile`, 
          {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = response.data;
        setFormData({
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          birthdate: userData.birthdate || '',
          nin: userData.nin || '',
          phone: userData.phone || '',
          location: userData.location || '',
          country: userData.country || '',
          gender: userData.gender || '',
          role: userData.role || '',
          servicesOffered: userData.servicesOffered || '',
        });
        if (userData.profileImage) {
          setProfileImagePreview(userData.profileImage);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    } else {
      console.log("No token found");
    }
  };
  fetchUserData();
}, []);

  
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
      }
    };
  
    const handleFieldChange = (field: keyof typeof formData) => ( e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
  
    const handleFieldGenderChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
    const handleFieldRoleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
    };
    const handleServicesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, servicesOffered: selectedOptions });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      // Validate NIN for Nigerian users
      if (formData.country === 'nigeria') {
        if (!formData.nin) {
          setErrorMessage("NIN is required for Nigerian users");
          setIsLoading(false);
          return;
        }
        const ninValidation = validateNIN(formData.nin);
        if (!ninValidation.isValid) {
          setErrorMessage(ninValidation.error);
          setIsLoading(false);
          return;
        }
      }

      // Validate phone number
      if (!formData.phone || formData.phone.length < 10) {
        setErrorMessage("Please enter a valid phone number");
        setIsLoading(false);
        return;
      }

      try {
        const data = new FormData();
        if (profileImage) {
          data.append('profileImage', profileImage);
        }
  
        Object.keys(formData).forEach((key) => {
          if (formData[key as keyof typeof formData]) {
            data.append(key, formData[key as keyof typeof formData] as string);
          }
        });
  
        // Get the token from sessionStorage
        const token = localStorage.getItem("authToken");
        if (!token) {
          setErrorMessage("You must be logged in to update your profile.");
          return;
        }
  
        // Decode the token and check for expiration
        const decoded: any = jwt_decode.jwtDecode(token);
        if (decoded.exp < Date.now() / 1000) {
          setErrorMessage("Session expired. Please log in again.");
          return;
        }
  
        // Proceed with the profile update if token is valid
        const response = await axios.put(
          `${baseUrl}/profile`, 
          data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          Swal.fire({
            title: 'Success!',
            text: 'Profile updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
          });
        }
      router.push('/userprofile')
      } catch (error: any) {
        if (error.response) {
          setErrorMessage(error.response.data.message || "Error updating profile.");
        } else {
          setErrorMessage(error.message || "An unknown error occurred.");
        }
         Swal.fire({
            title: 'Error!',
            text: 'Profile update failed',
            icon: 'error',
            confirmButtonText: 'OK'
          });
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className={styles.create_profileBox}>
      <main>
        <form className={styles.create_profileForm} onSubmit={handleSubmit}>
          <div className={styles.form_header}>
            <h1>Complete Your Profile</h1>
            <p>Help us personalize your experience by completing your profile information</p>
          </div>

          {/* Profile Image Upload */}
          <div className={styles.profileImageContainer}>
            <label htmlFor="profileImageUpload" className={styles.uploadLabel}>
              <MdCloudUpload size={20} />
              Upload Profile Picture
            </label>
            <input
              type="file"
              id="profileImageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.uploadInput}
            />
            {profileImagePreview && (
              <div className={styles.imagePreview}>
                <img
                  src={profileImagePreview}
                  alt="Profile Preview"
                  className={styles.previewImg}
                />
              </div>
            )}
          </div>

          {/* Personal Information Section */}
          <div className={styles.form_section}>
            <h3 className={styles.section_title}>
              <MdPerson className="inline-icon" />
              Personal Information
            </h3>
            
            <div className={styles.input_items}>
              <input
                type="text"
                placeholder="First Name"
                className={styles.items}
                value={formData.firstname}
                onChange={handleFieldChange('firstname')}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className={styles.items}
                value={formData.lastname}
                onChange={handleFieldChange('lastname')}
                required
              />
            </div>
            
            <div className={styles.input_items}>
              <input
                type="email"
                placeholder="Email Address"
                className={styles.emailitems}
                value={formData.email}
                onChange={handleFieldChange('email')}
                readOnly
              />
            </div>
            
            <div className={styles.input_items}>
              <div className={styles.datebox}>
                <label htmlFor="birthdate">
                  <FiCalendar className="inline-icon" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  className={styles.item}
                  value={formData.birthdate}
                  onChange={handleFieldChange('birthdate')}
                  required
                />
              </div>
              <select
                className={styles.items}
                value={formData.gender}
                onChange={handleFieldGenderChange('gender')}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Location/Country Section */}
          <div className={styles.form_section}>
            <h3 className={styles.section_title}>
              <MdLocationOn className="inline-icon" />
              Location Information
            </h3>
            
            <div className={styles.input_items}>
              <select
                className={styles.items}
                value={formData.country}
                onChange={(e) => {
                  const selectedCountry = countries.find(c => c.value === e.target.value);
                  if (selectedCountry) {
                    handleCountryChange(selectedCountry);
                  }
                }}
                required
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.country === 'nigeria' && (
              <div className={styles.input_items}>
                <select
                  className={styles.items}
                  value={selectedState?.value || ''}
                  onChange={(e) => {
                    const selectedStateOption = nigerianStates.find(s => s.value === e.target.value);
                    if (selectedStateOption) {
                      handleStateChange(selectedStateOption);
                    }
                  }}
                  required
                >
                  <option value="">Select State</option>
                  {nigerianStates.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>

                {selectedState && (
                  <select
                    className={styles.items}
                    value={selectedLga?.value || ''}
                    onChange={(e) => {
                      const selectedLgaOption = selectedState.lgas.find((lga: string) => lga === e.target.value);
                      if (selectedLgaOption) {
                        handleLgaChange({ value: selectedLgaOption, label: selectedLgaOption });
                      }
                    }}
                  >
                    <option value="">Select LGA</option>
                    {selectedState.lgas.map((lga: string) => (
                      <option key={lga} value={lga}>
                        {lga}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {formData.country && formData.country !== 'nigeria' && (
              <div className={styles.input_items}>
                <input
                  type="text"
                  placeholder="Enter your city/state"
                  className={styles.items}
                  value={formData.location}
                  onChange={handleFieldChange('location')}
                  required
                />
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className={styles.form_section}>
            <h3 className={styles.section_title}>
              <MdPhone className="inline-icon" />
              Contact Information
            </h3>
            
            <div className={styles.input_items}>
              {/* NIN field - only for Nigerian users */}
              {formData.country === 'nigeria' && (
                <div className={styles.nin_container}>
                  <div className={styles.nin_input_wrapper}>
                    <input
                      type="text"
                      placeholder="National ID Number (NIN)"
                      className={`${styles.items} ${ninError ? styles.error : formData.nin.length === 11 && !ninError ? styles.valid : ''}`}
                      value={formData.nin}
                      onChange={(e) => handleNinChange(e.target.value)}
                      maxLength={11}
                      pattern="\d{11}"
                      required
                    />
                    {formData.nin.length === 11 && !ninError && (
                      <FiCheck className={styles.valid_icon} />
                    )}
                  </div>
                  <div className={styles.nin_help}>
                    <small>Enter your 11-digit National Identification Number (Required for Nigerians)</small>
                  </div>
                  {ninError && <span className={styles.error_text}>{ninError}</span>}
                  {formData.nin.length === 11 && !ninError && (
                    <span className={styles.success_text}>
                      ✓ NIN format is valid
                    </span>
                  )}
                </div>
              )}
              <div className={styles.phone_input_wrapper}>
                <PhoneInput
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value || '' }))}
                  defaultCountry="NG"
                  international
                  countryCallingCodeEditable={false}
                />
              </div>
            </div>
          </div>

          {/* Role Selection Section */}
          <div className={styles.form_section}>
            <h3 className={styles.section_title}>
              <FiUser className="inline-icon" />
              Account Type
            </h3>
            
            <div className={styles.role_section}>
              <div className={styles.role_options}>
                <div 
                  className={`${styles.role_option} ${formData.role === 'customer' ? styles.selected : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'customer', servicesOffered: [] }))}
                >
                  <h3>Customer</h3>
                  <p>I want to book and use services</p>
                </div>
                <div 
                  className={`${styles.role_option} ${formData.role === 'vendor' ? styles.selected : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, role: 'vendor' }))}
                >
                  <h3>Service Provider</h3>
                  <p>I want to offer services to customers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section - Only for Vendors */}
          {formData.role === 'vendor' && (
            <div className={styles.form_section}>
              <h3 className={styles.section_title}>
                <FiCheck className="inline-icon" />
                Services You Offer
              </h3>
              
              <div className={styles.services_section}>
                <div className={styles.services_grid}>
                  {['Cleaning', 'Tutoring', 'Delivery', 'Repair', 'Beauty', 'Fitness', 'Photography', 'Catering', 'Transportation', 'Pet Care', 'Gardening', 'Other'].map((service) => (
                    <div
                      key={service}
                      className={`${styles.service_option} ${
                        formData.servicesOffered.includes(service) ? styles.selected : ''
                      }`}
                      onClick={() => {
                        const isSelected = formData.servicesOffered.includes(service);
                        if (isSelected) {
                          setFormData(prev => ({
                            ...prev,
                            servicesOffered: prev.servicesOffered.filter(s => s !== service)
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            servicesOffered: [...prev.servicesOffered, service]
                          }));
                        }
                      }}
                    >
                      {service.charAt(0).toUpperCase() + service.slice(1)}
                    </div>
                  ))}
                </div>
                
                {formData.servicesOffered.length > 0 && (
                  <div className={styles.pro}>
                    <ul>
                      {formData.servicesOffered.map((service, index) => (
                        <li key={index}>
                          {service.charAt(0).toUpperCase() + service.slice(1)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className={styles.createbtn} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Creating Profile...
              </>
            ) : (
              <>
                <FiCheck size={20} />
                Complete Profile
              </>
            )}
          </button>

          {/* Error/Success Messages */}
          {errorMessage && (
            <div className={styles.error_message}>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className={styles.success_message}>
              {successMessage}
            </div>
          )}
        </form>
      </main>
    </div>
  );
};

export default CreateProfile;

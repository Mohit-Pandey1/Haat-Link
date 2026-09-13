import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mic,
  Sprout,
  ShieldCheck,
  Wifi,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const roles = [
  { value: 'farmer', icon: '🌾', label: 'Farmer', local: 'शेतकरी' },
  { value: 'fpo', icon: '🚜', label: 'FPO / SHG', local: 'गट / संघ' },
  { value: 'buyer', icon: '🏢', label: 'Buyer', local: 'व्यापारी' },
];

const districts = ['Nashik', 'Pune', 'Latur', 'Amravati', 'Kolhapur'];

const translations = {
  en: {
    voiceAssist: 'Voice Assist',
    listening: 'Listening... Speak now',
    unsupported:
      'Voice assistance is not supported in this browser. You can type your details instead.',
    microphoneDenied: 'Microphone access needed for Voice Assistant.',
    switchedSignin: 'Switched to Sign In',
    switchedRegister: 'Switched to Registration',
    farmerSelected: 'Farmer role selected',
    fpoSelected: 'FPO role selected',
    buyerSelected: 'Buyer role selected',
    welcome: 'Welcome to HaatLink',
    registerTitle: 'Create your mandi account',
    registerSubtitle: 'Set up your profile to trade with confidence.',
    signinTitle: 'Welcome back',
    signinSubtitle:
      'Access mandi rates, manage harvest lots, and finalize trade deals.',
    tabSignIn: 'Sign In',
    tabRegister: 'Register',
    chooseRole: 'Choose your role',
    roleFarmer: 'Farmer',
    roleFarmerSub: 'Grower & Seller',
    roleFpo: 'FPO / SHG',
    roleFpoSub: 'Farmer Collective',
    roleBuyer: 'Buyer',
    roleBuyerSub: 'Trader & Industry',
    labelFullName: 'Full name',
    phFullName: 'e.g. Suresh Patil',
    labelMobile: '10-digit mobile',
    phMobile: '9876543210',
    labelDistrict: 'District / APMC',
    selectDistrictDefault: 'Select APMC District',
    labelUsername: 'Username',
    phUsername: 'Choose a mandi username',
    usernameHint: 'optional, generated from your name if blank',
    labelPassword: 'Password',
    phPassword: 'Enter secure password',
    btnRegister: 'Verify Mobile via OTP',
    btnSignIn: 'Sign In to Mandi',
    quickOtp: 'Sign in with WhatsApp / SMS OTP instead',
    encryptedNote: '256-Bit Encrypted • Session stored in secure cookie',
    signingIn: 'Signing you in...',
    registering: 'Creating your account...',
    loginRequired: 'Enter your phone or username and password.',
    registerRequired:
      'Enter your full name and a valid 10-digit mobile number.',
    welcomeLine: 'Pick up where you left off with your harvest and buyers.',
    registerWelcome: 'Set up your profile to trade with confidence.',
    showcaseKicker: 'THE MANDI, MADE CLEAR',
    showcaseTitle: 'Know your crop. Name your price.',
    showcaseSubtitle:
      "Transparent market intelligence and direct buyer procurement for Maharashtra's smallholders and FPOs.",
    trustMarket: 'Agmarknet & e-NAM Synced',
    trustLoss: '0% Arbitrage Loss',
    trustEscrow: 'Instant Escrow Payouts',
    showcaseFooter: "Built for India's growers & institutional buyers",
    support: 'MahaAgri support',
  },
  mr: {
    voiceAssist: 'आवाज सहाय्य',
    listening: 'ऐकत आहे... बोला',
    unsupported:
      'या ब्राउझरमध्ये आवाज सहाय्य उपलब्ध नाही. कृपया तपशील टाइप करा.',
    microphoneDenied: 'व्हॉइस असिस्टंटसाठी मायक्रोफोनची परवानगी आवश्यक आहे.',
    switchedSignin: 'लॉग इन निवडले आहे',
    switchedRegister: 'नोंदणी निवडली आहे',
    farmerSelected: 'शेतकरी भूमिका निवडली आहे',
    fpoSelected: 'एफपीओ भूमिका निवडली आहे',
    buyerSelected: 'खरेदीदार भूमिका निवडली आहे',
    welcome: 'हाटलिंकवर आपले स्वागत आहे',
    registerTitle: 'तुमचे मंडी खाते तयार करा',
    registerSubtitle: 'आत्मविश्वासाने शेतमाल व्यापार करण्यासाठी नोंदणी करा.',
    signinTitle: 'पुन्हा स्वागत आहे',
    signinSubtitle:
      'मंडीचे थेट भाव, शेतमाल नोंदी आणि खरेदी-विक्री व्यवस्थापित करा.',
    tabSignIn: 'लॉग इन',
    tabRegister: 'नोंदणी करा',
    chooseRole: 'तुमची भूमिका निवडा',
    roleFarmer: 'शेतकरी',
    roleFarmerSub: 'उत्पादक व विक्रेता',
    roleFpo: 'एफपीओ / बचत गट',
    roleFpoSub: 'शेतकरी संघ',
    roleBuyer: 'खरेदीदार',
    roleBuyerSub: 'व्यापारी व प्रक्रियादार',
    labelFullName: 'पूर्ण नाव',
    phFullName: 'उदा. सुरेश पाटील',
    labelMobile: '१० अंकी मोबाईल नंबर',
    phMobile: '९८७६५४३२१०',
    labelDistrict: 'जिल्हा / कृषी उत्पन्न बाजार समिती',
    selectDistrictDefault: 'बाजार समिती जिल्हा निवडा',
    labelUsername: 'वापरकर्ता नाव (युझरनेम)',
    phUsername: 'मंडी युझरनेम निवडा',
    usernameHint: 'पर्यायी, रिक्त ठेवल्यास नावावरून तयार होईल',
    labelPassword: 'पासवर्ड',
    phPassword: 'सुरक्षित पासवर्ड टाका',
    btnRegister: 'ओटीपी द्वारे पडताळणी करा',
    btnSignIn: 'मंडीत प्रवेश करा',
    quickOtp: 'व्हॉट्सॲप किंवा एसएमएस ओटीपीने लॉगिन करा',
    encryptedNote: '२५६-बिट सुरक्षित एन्क्रिप्शन • डेटा सुरक्षित आहे',
    signingIn: 'लॉगिन सुरू आहे...',
    registering: 'खाते तयार होत आहे...',
    loginRequired: 'तुमचा फोन किंवा युझरनेम आणि पासवर्ड टाका.',
    registerRequired: 'पूर्ण नाव आणि योग्य १० अंकी मोबाईल नंबर टाका.',
    welcomeLine: 'आपल्या शेतमाल आणि खरेदीदारांसह पुढे सुरू ठेवा.',
    registerWelcome: 'आत्मविश्वासाने व्यापार करण्यासाठी प्रोफाइल तयार करा.',
    showcaseKicker: 'मंडीचे भाव, आता स्पष्ट',
    showcaseTitle: 'तुमचा शेतमाल. तुमचा भाव.',
    showcaseSubtitle:
      'महाराष्ट्रातील अल्पभूधारक आणि एफपीओंसाठी पारदर्शक बाजार माहिती व थेट खरेदीदार संपर्क.',
    trustMarket: 'अ‍ॅगमार्कनेट आणि ई-नाम जोडलेले',
    trustLoss: '०% दलाली नुकसान',
    trustEscrow: 'त्वरित एस्क्रो पेमेंट',
    showcaseFooter: 'भारताच्या शेतकरी आणि संस्थात्मक खरेदीदारांसाठी',
    support: 'महाॲग्री सहाय्य',
  },
  hi: {
    voiceAssist: 'आवाज़ सहायता',
    listening: 'सुन रहा हूँ... बोलिए',
    unsupported:
      'इस ब्राउज़र में आवाज़ सहायता उपलब्ध नहीं है। कृपया विवरण टाइप करें।',
    microphoneDenied: 'वॉइस असिस्टेंट के लिए माइक्रोफ़ोन की अनुमति चाहिए।',
    switchedSignin: 'साइन इन चुना गया है',
    switchedRegister: 'पंजीकरण चुना गया है',
    farmerSelected: 'किसान की भूमिका चुनी गई है',
    fpoSelected: 'एफपीओ की भूमिका चुनी गई है',
    buyerSelected: 'खरीदार की भूमिका चुनी गई है',
    welcome: 'हाटलिंक में आपका स्वागत है',
    registerTitle: 'अपना मंडी खाता बनाएं',
    registerSubtitle: 'विश्वास के साथ व्यापार करने के लिए अपनी प्रोफाइल बनाएं।',
    signinTitle: 'वापसी पर स्वागत है',
    signinSubtitle: 'मंडी भाव, फसल लॉट और सौदों का प्रबंधन करें।',
    tabSignIn: 'साइन इन',
    tabRegister: 'पंजीकरण',
    chooseRole: 'अपनी भूमिका चुनें',
    roleFarmer: 'किसान',
    roleFarmerSub: 'उत्पादक व विक्रेता',
    roleFpo: 'एफपीओ / समूह',
    roleFpoSub: 'किसान संगठन',
    roleBuyer: 'खरीदार',
    roleBuyerSub: 'व्यापारी व उद्योग',
    labelFullName: 'पूरा नाम',
    phFullName: 'उदा. सुरेश पाटिल',
    labelMobile: '10-अंकीय मोबाइल नंबर',
    phMobile: '9876543210',
    labelDistrict: 'जिला / मंडी (APMC)',
    selectDistrictDefault: 'मंडी जिला चुनें',
    labelUsername: 'उपयोगकर्ता नाम (यूज़रनेम)',
    phUsername: 'मंडी यूज़रनेम चुनें',
    usernameHint: 'वैकल्पिक, खाली रहने पर नाम से बनेगा',
    labelPassword: 'पासवर्ड',
    phPassword: 'सुरक्षित पासवर्ड दर्ज करें',
    btnRegister: 'ओटीपी से मोबाइल सत्यापित करें',
    btnSignIn: 'मंडी में प्रवेश करें',
    quickOtp: 'व्हाट्सएप या एसएमएस ओटीपी से लॉगिन करें',
    encryptedNote: '256-बिट सुरक्षित एन्क्रिप्शन • सत्र सुरक्षित कुकी में है',
    signingIn: 'साइन इन हो रहा है...',
    registering: 'खाता बनाया जा रहा है...',
    loginRequired: 'अपना फोन या यूज़रनेम और पासवर्ड दर्ज करें।',
    registerRequired: 'पूरा नाम और सही 10-अंकीय मोबाइल नंबर दर्ज करें।',
    welcomeLine: 'अपनी फसल और खरीदारों के साथ वहीं से शुरू करें जहां छोड़ा था।',
    registerWelcome: 'विश्वास के साथ व्यापार करने के लिए अपनी प्रोफाइल बनाएं।',
    showcaseKicker: 'मंडी के भाव, अब साफ',
    showcaseTitle: 'अपनी फसल जानें। अपना भाव तय करें।',
    showcaseSubtitle:
      'महाराष्ट्र के छोटे किसानों और एफपीओ के लिए पारदर्शी बाजार जानकारी और सीधे खरीदार।',
    trustMarket: 'एगमार्कनेट और ई-नाम से जुड़ा',
    trustLoss: '०% बिचौलिया नुकसान',
    trustEscrow: 'तुरंत एस्क्रो भुगतान',
    showcaseFooter: 'भारत के किसानों और संस्थागत खरीदारों के लिए',
    support: 'महाॲग्री सहायता',
  },
};

function TerrainCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 2.3, 8);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const group = new THREE.Group();
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const gold = new THREE.Color('#E3AC47');
    const green = new THREE.Color('#4E7A55');
    const columns = 32;
    const rows = 22;

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const x = (column / (columns - 1) - 0.5) * 9;
        const z = (row / (rows - 1) - 0.5) * 5.2;
        const y = Math.sin(column * 0.45) * 0.12 + Math.cos(row * 0.4) * 0.1;
        positions.push(x, y, z);
        colors.push(...(column % 5 === 0 ? gold : green).toArray());
      }
    }
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    group.add(new THREE.Points(geometry, material));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x6d9c68,
      transparent: true,
      opacity: 0.16,
    });
    for (let row = 0; row < rows; row += 3) {
      const points = [];
      for (let column = 0; column < columns; column += 1) {
        points.push(
          new THREE.Vector3(
            (column / (columns - 1) - 0.5) * 9,
            0.02,
            (row / (rows - 1) - 0.5) * 5.2
          )
        );
      }
      group.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          lineMaterial
        )
      );
    }
    scene.add(group);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.35;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.2;
    };
    const resize = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    let frame;
    const animate = (time) => {
      const wind = time * 0.00035;
      group.rotation.y += (pointer.x - group.rotation.y) * 0.025;
      group.rotation.x += (-pointer.y - group.rotation.x) * 0.025;
      group.position.y = Math.sin(wind) * 0.08;
      group.children[0].rotation.z = Math.sin(wind * 1.6) * 0.025;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove);
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      geometry.dispose();
      material.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="sih-terrain" aria-hidden="true" />;
}

function PasswordField({
  id,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}) {
  return (
    <div className="sih-password-field">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        minLength={6}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

export function LoginPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('farmer');
  const [regDistrict, setRegDistrict] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem('haatlink-language');
    return translations[stored] ? stored : 'en';
  });
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);
  const { login, register } = useAuth();
  const { setRole } = useApp();
  const navigate = useNavigate();
  const t = translations[language];

  const changeLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem('haatlink-language', nextLanguage);
    setError('');
  };

  const speakFeedback = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const switchAuthTab = (nextTab, feedback) => {
    setTab(nextTab);
    setError('');
    speakFeedback(feedback);
  };

  const normalizeSpeechDigits = (value) => {
    const digitMap = {
      '०': '0',
      '१': '1',
      '२': '2',
      '३': '3',
      '४': '4',
      '५': '5',
      '६': '6',
      '७': '7',
      '८': '8',
      '९': '9',
    };
    return value.replace(/[०-९]/g, (digit) => digitMap[digit]);
  };

  const extractSpokenDigits = (value) => {
    const words = {
      zero: '0',
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      nine: '9',
      शून्य: '0',
      एक: '1',
      दो: '2',
      तीन: '3',
      चार: '4',
      पांच: '5',
      छह: '6',
      सात: '7',
      आठ: '8',
      नौ: '9',
      शून: '0',
      दोन: '2',
      पाच: '5',
      सहा: '6',
      नऊ: '9',
    };
    return value
      .toLowerCase()
      .split(/\s+/)
      .map(
        (word) => words[word.replace(/[,.]/g, '')] || word.replace(/\D/g, '')
      )
      .join('');
  };

  const startVoiceAssistant = () => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError(t.microphoneDenied);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Recognition();
    recognition.lang =
      language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      recognitionRef.current = null;
      setError(
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? t.microphoneDenied
          : t.unsupported
      );
    };
    recognition.onresult = (event) => {
      const result =
        event.results[event.resultIndex || event.results.length - 1];
      const transcript = normalizeSpeechDigits(result[0].transcript.trim());
      setVoiceTranscript(transcript);
      if (!result.isFinal) return;
      const spoken = transcript.toLowerCase();
      if (
        spoken.includes('sign in') ||
        spoken.includes('login') ||
        spoken.includes('लॉग इन') ||
        spoken.includes('साइन इन')
      ) {
        switchAuthTab('login', t.switchedSignin);
      } else if (
        spoken.includes('register') ||
        spoken.includes('create account') ||
        spoken.includes('नोंदणी') ||
        spoken.includes('रजिस्टर') ||
        spoken.includes('खाते')
      ) {
        switchAuthTab('register', t.switchedRegister);
      }
      const roleMap = [
        ['buyer', ['buyer', 'trader', 'खरीदार', 'व्यापारी'], t.buyerSelected],
        [
          'fpo',
          ['fpo', 'collective', 'shg', 'एफपीओ', 'बचत गट', 'समूह', 'संघ'],
          t.fpoSelected,
        ],
        ['farmer', ['farmer', 'grower', 'शेतकरी', 'किसान'], t.farmerSelected],
      ];
      const detectedRole = roleMap.find(([, words]) =>
        words.some((word) => spoken.includes(word))
      );
      if (detectedRole) {
        setTab('register');
        setRegRole(detectedRole[0]);
        speakFeedback(detectedRole[2]);
      }

      const digits = extractSpokenDigits(transcript);
      if (digits.length >= 10) {
        setRegPhone(digits.slice(-10));
        setTab('register');
      } else if (transcript && !detectedRole) {
        const nameMatch = transcript.match(
          /(?:my name is|name is|नाव|नाम)\s+(.+)/i
        );
        if (nameMatch) setRegName(nameMatch[1].trim());
        else if (
          !spoken.includes('sign in') &&
          !spoken.includes('login') &&
          !spoken.includes('register')
        )
          setRegName(transcript);
        setTab('register');
      }

      const districtMap = [
        ['Nashik', ['nashik', 'नाशिक']],
        ['Pune', ['pune', 'पुणे']],
        ['Latur', ['latur', 'लातूर']],
        ['Amravati', ['amravati', 'अमरावती']],
        ['Kolhapur', ['kolhapur', 'कोल्हापूर']],
      ];
      const district = districtMap.find(([, names]) =>
        names.some((name) => spoken.includes(name))
      );
      if (district) setRegDistrict(district[0]);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceAssistant = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  };

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    },
    []
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    stopVoiceAssistant();
    setError('');
    if (!loginIdentifier.trim() || !loginPassword) {
      setError(t.loginRequired);
      return;
    }
    setLoading(true);
    try {
      const response = await login(loginIdentifier.trim(), loginPassword);
      const userRole = response.user?.role || 'farmer';
      setRole(userRole);
      navigate(userRole === 'buyer' ? '/buyer/dashboard' : '/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Sign in failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    stopVoiceAssistant();
    setError('');
    if (!regName.trim() || !/^[0-9]{10}$/.test(regPhone.trim())) {
      setError(t.registerRequired);
      return;
    }
    setLoading(true);
    try {
      const username =
        regUsername.trim() ||
        `${regName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')}_${regPhone.slice(-4)}`;
      const role = regRole === 'buyer' ? 'buyer' : 'farmer';
      const response = await register({
        username,
        name: regName.trim(),
        phone: regPhone.trim(),
        role,
        password: regPassword,
        district: regDistrict,
      });
      const userRole = response.user?.role || role;
      setRole(userRole);
      navigate(userRole === 'buyer' ? '/buyer/dashboard' : '/dashboard');
    } catch (requestError) {
      setError(
        requestError.message || 'Registration failed. Check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sih-auth-shell">
      <section className="sih-showcase">
        <TerrainCanvas />
        <div className="sih-vignette" />
        <div className="sih-showcase-content">
          <header className="sih-brand-row">
            <div className="sih-brand">
              <span>
                <Sprout size={20} />
              </span>{' '}
              HaatLink
            </div>
            <div className="sih-apmc-badge">
              <i />{' '}
              <span>
                Lasalgaon Onion: <b>₹2,340 / qtl</b> <em>+3.8%</em>
              </span>
            </div>
          </header>
          <div className="sih-hero-copy">
            <span className="sih-kicker">{t.showcaseKicker}</span>
            <h1 className="sih-hero-title">{t.showcaseTitle}</h1>
            <p>{t.showcaseSubtitle}</p>
            <div className="sih-trust-badges">
              <span>
                <Wifi size={14} /> {t.trustMarket}
              </span>
              <span>
                <ShieldCheck size={14} /> {t.trustLoss}
              </span>
              <span>
                <span className="sih-badge-dot" /> {t.trustEscrow}
              </span>
            </div>
          </div>
          <footer className="sih-showcase-footer">
            ✓ {t.showcaseFooter} <b>|</b> SIH 2026 <b>•</b> PS ID: 26132
          </footer>
        </div>
      </section>

      <section className="sih-auth-panel">
        <div className="sih-auth-inner">
          <div className="sih-auth-topbar">
            <div className="sih-language-switcher">
              {['EN', 'मराठी', 'हिंदी'].map((item) => (
                <button
                  type="button"
                  className={
                    language ===
                    (item === 'EN' ? 'en' : item === 'मराठी' ? 'mr' : 'hi')
                      ? 'active'
                      : ''
                  }
                  key={item}
                  onClick={() =>
                    changeLanguage(
                      item === 'EN' ? 'en' : item === 'मराठी' ? 'mr' : 'hi'
                    )
                  }
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={
                isListening ? 'sih-voice-button listening' : 'sih-voice-button'
              }
              onClick={startVoiceAssistant}
            >
              <Mic size={16} /> {isListening ? t.listening : t.voiceAssist}
            </button>
          </div>
          {voiceTranscript && (
            <div
              className="sih-voice-transcript"
              role="status"
              aria-live="polite"
            >
              <Mic size={14} /> <span>{voiceTranscript}</span>
            </div>
          )}
          <div className="sih-auth-heading">
            <span>{t.welcome}</span>
            <h2>{tab === 'login' ? t.signinTitle : t.registerTitle}</h2>
            <p>{tab === 'login' ? t.signinSubtitle : t.registerSubtitle}</p>
          </div>
          <div className="sih-tab-pill">
            <span
              className={tab === 'login' ? 'login-active' : 'register-active'}
            />
            <button
              type="button"
              className={tab === 'login' ? 'active' : ''}
              onClick={() => {
                setTab('login');
                setError('');
              }}
            >
              {t.tabSignIn}
            </button>
            <button
              type="button"
              className={tab === 'register' ? 'active' : ''}
              onClick={() => {
                setTab('register');
                setError('');
              }}
            >
              {t.tabRegister}
            </button>
          </div>
          {error && <div className="sih-auth-error">{error}</div>}
          {tab === 'login' ? (
            <form className="sih-form" onSubmit={handleLogin}>
              <label htmlFor="login-id">
                {t.labelMobile} / {t.labelUsername}
                <input
                  id="login-id"
                  value={loginIdentifier}
                  onChange={(event) => setLoginIdentifier(event.target.value)}
                  placeholder={`${t.phMobile} / ${t.phUsername}`}
                  autoComplete="username"
                  required
                />
              </label>
              <label htmlFor="login-password">
                {t.labelPassword}
                <PasswordField
                  id="login-password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  visible={showLoginPassword}
                  onToggle={() => setShowLoginPassword((value) => !value)}
                  placeholder={t.phPassword}
                />
              </label>
              <button
                type="button"
                className="sih-alt-auth"
                onClick={() =>
                  setError(
                    'Use your registered phone or username to sign in securely.'
                  )
                }
              >
                {t.quickOtp}
              </button>
              <button type="submit" className="sih-submit" disabled={loading}>
                {loading ? t.signingIn : t.btnSignIn}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          ) : (
            <form
              className="sih-form sih-register-form"
              onSubmit={handleRegister}
            >
              <fieldset className="sih-role-field">
                <legend>{t.chooseRole}</legend>
                <div className="sih-role-grid">
                  {roles.map((role) => (
                    <label
                      className={regRole === role.value ? 'selected' : ''}
                      key={role.value}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={regRole === role.value}
                        onChange={(event) => setRegRole(event.target.value)}
                      />
                      <strong>{role.icon}</strong>
                      <span>
                        {role.value === 'farmer'
                          ? t.roleFarmer
                          : role.value === 'fpo'
                            ? t.roleFpo
                            : t.roleBuyer}
                      </span>
                      <small>
                        {role.value === 'farmer'
                          ? t.roleFarmerSub
                          : role.value === 'fpo'
                            ? t.roleFpoSub
                            : t.roleBuyerSub}
                      </small>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="sih-form-grid">
                <label htmlFor="reg-name">
                  {t.labelFullName}
                  <input
                    id="reg-name"
                    value={regName}
                    onChange={(event) => setRegName(event.target.value)}
                    placeholder={t.phFullName}
                    autoComplete="name"
                    required
                  />
                </label>
                <label htmlFor="reg-phone">
                  {t.labelMobile}
                  <input
                    id="reg-phone"
                    value={regPhone}
                    onChange={(event) =>
                      setRegPhone(
                        event.target.value.replace(/\D/g, '').slice(0, 10)
                      )
                    }
                    placeholder={t.phMobile}
                    inputMode="numeric"
                    autoComplete="tel"
                    required
                  />
                </label>
              </div>
              <label htmlFor="reg-district">
                {t.labelDistrict}
                <select
                  id="reg-district"
                  value={regDistrict}
                  onChange={(event) => setRegDistrict(event.target.value)}
                >
                  <option value="">{t.selectDistrictDefault}</option>
                  {districts.map((district) => (
                    <option key={district}>{district}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="reg-username">
                {t.labelUsername}{' '}
                <small className="sih-optional">{t.usernameHint}</small>
                <input
                  id="reg-username"
                  value={regUsername}
                  onChange={(event) => setRegUsername(event.target.value)}
                  placeholder={t.phUsername}
                  autoComplete="username"
                />
              </label>
              <label htmlFor="reg-password">
                {t.labelPassword}
                <PasswordField
                  id="reg-password"
                  value={regPassword}
                  onChange={(event) => setRegPassword(event.target.value)}
                  visible={showRegPassword}
                  onToggle={() => setShowRegPassword((value) => !value)}
                  placeholder={t.phPassword}
                />
              </label>
              <button type="submit" className="sih-submit" disabled={loading}>
                {loading ? t.registering : t.btnRegister}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>
          )}
          <footer className="sih-auth-footer">
            <span>{t.encryptedNote}</span>
            <a href="mailto:support@mahaagri.in">{t.support}</a>
          </footer>
        </div>
      </section>
    </main>
  );
}

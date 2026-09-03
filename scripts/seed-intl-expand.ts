/* eslint-disable */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface DeptData {
  name: string;
  courses: { name: string; degree: string; duration: string }[];
}

interface UniData {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  type: string;
  foundedYear: number;
  departments: DeptData[];
}

const currencyMap: Record<string, string> = {
  'United States': 'USD', 'United Kingdom': 'GBP', 'Canada': 'CAD', 'Australia': 'AUD',
  'Germany': 'EUR', 'France': 'EUR', 'Italy': 'EUR', 'Spain': 'EUR', 'Netherlands': 'EUR',
  'Switzerland': 'CHF', 'Sweden': 'SEK', 'Norway': 'NOK', 'Denmark': 'DKK', 'Finland': 'EUR',
  'India': 'INR', 'China': 'CNY', 'Japan': 'JPY', 'South Korea': 'KRW',
  'Singapore': 'SGD', 'Malaysia': 'MYR', 'Turkey': 'TRY', 'UAE': 'AED',
  'Saudi Arabia': 'SAR', 'New Zealand': 'NZD', 'Ireland': 'EUR',
  'Philippines': 'PHP', 'Thailand': 'THB', 'Hungary': 'HUF', 'Poland': 'PLN',
  'Russia': 'RUB', 'Brazil': 'BRL', 'South Africa': 'ZAR', 'Egypt': 'EGP',
};

const newUniversities: UniData[] = [
  // ── INDIA (6 unis, 3 cities) ──
  { id: 'uni-in-001', name: 'Indian Institute of Technology Bombay (IIT Bombay)', country: 'India', city: 'Mumbai', website: 'https://www.iitb.ac.in', type: 'public', foundedYear: 1958, departments: [
    { name: 'Computer Science and Engineering', courses: [
      { name: 'B.Tech Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'M.Tech Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '5 years' },
    ]},
    { name: 'Electrical Engineering', courses: [
      { name: 'B.Tech Electrical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'M.Tech Power Systems', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Mechanical Engineering', courses: [
      { name: 'B.Tech Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'M.Tech Thermal Engineering', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Chemical Engineering', courses: [
      { name: 'B.Tech Chemical Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Aerospace Engineering', courses: [
      { name: 'B.Tech Aerospace Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Mathematics', courses: [
      { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
    ]},
  ]},
  { id: 'uni-in-002', name: 'Indian Institute of Science (IISc) Bangalore', country: 'India', city: 'Bangalore', website: 'https://www.iisc.ac.in', type: 'public', foundedYear: 1909, departments: [
    { name: 'Computer Science and Automation', courses: [
      { name: 'B.Tech Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'M.Tech Artificial Intelligence', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '5 years' },
    ]},
    { name: 'Electrical Engineering', courses: [
      { name: 'B.Tech Electrical Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Biological Sciences', courses: [
      { name: 'BS Biological Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'PhD Biological Sciences', degree: 'phd', duration: '5 years' },
    ]},
    { name: 'Physical Sciences', courses: [
      { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
      { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  { id: 'uni-in-003', name: 'University of Delhi', country: 'India', city: 'New Delhi', website: 'https://www.du.ac.in', type: 'public', foundedYear: 1922, departments: [
    { name: 'Faculty of Science', courses: [
      { name: 'BSc Physics (Hons)', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Chemistry (Hons)', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Mathematics (Hons)', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Physics', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Arts', courses: [
      { name: 'BA Economics (Hons)', degree: 'bachelor', duration: '3 years' },
      { name: 'BA English (Hons)', degree: 'bachelor', duration: '3 years' },
      { name: 'BA Political Science (Hons)', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'Faculty of Commerce', courses: [
      { name: 'BCom (Hons)', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  // ── TURKEY (3 unis, 2 cities) ──
  { id: 'uni-tr-001', name: 'Bogazici University', country: 'Turkey', city: 'Istanbul', website: 'https://www.boun.edu.tr', type: 'public', foundedYear: 1971, departments: [
    { name: 'Computer Engineering', courses: [
      { name: 'BSc Computer Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Computer Engineering', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Electrical and Electronics Engineering', courses: [
      { name: 'BSc Electrical and Electronics Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Economics and Administrative Sciences', courses: [
      { name: 'BSc Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'BBA Business Administration', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Science', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  { id: 'uni-tr-002', name: 'METU (Middle East Technical University)', country: 'Turkey', city: 'Ankara', website: 'https://www.metu.edu.tr', type: 'public', foundedYear: 1956, departments: [
    { name: 'Computer Engineering', courses: [
      { name: 'BSc Computer Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Computer Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Engineering', degree: 'phd', duration: '5 years' },
    ]},
    { name: 'Aerospace Engineering', courses: [
      { name: 'BSc Aerospace Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Civil Engineering', courses: [
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Sciences', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Statistics', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  // ── MALAYSIA (3 unis, 2 cities) ──
  { id: 'uni-my-001', name: 'University of Malaya (UM)', country: 'Malaysia', city: 'Kuala Lumpur', website: 'https://www.um.edu.my', type: 'public', foundedYear: 1905, departments: [
    { name: 'Computer Science and Information Technology', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3.5 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'BEng Electrical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BEng Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BEng Civil Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Business and Economics', courses: [
      { name: 'BBA', degree: 'bachelor', duration: '3.5 years' },
      { name: 'BSc Economics', degree: 'bachelor', duration: '3.5 years' },
    ]},
    { name: 'Medicine', courses: [
      { name: 'MBBS', degree: 'bachelor', duration: '5 years' },
    ]},
  ]},
  { id: 'uni-my-002', name: "Taylor's University", country: 'Malaysia', city: 'Subang Jaya', website: 'https://www.taylors.edu.my', type: 'private', foundedYear: 1969, departments: [
    { name: 'School of Computing and Technology', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Data Science', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'School of Business', courses: [
      { name: 'BBA (Hons)', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'School of Hospitality and Tourism', courses: [
      { name: 'BSc Hospitality Management', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  // ── UAE (2 unis, 2 cities) ──
  { id: 'uni-ae-001', name: 'Khalifa University', country: 'UAE', city: 'Abu Dhabi', website: 'https://www.ku.ac.ae', type: 'public', foundedYear: 2007, departments: [
    { name: 'Engineering', courses: [
      { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Electrical and Computer Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Aerospace Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Artificial Intelligence', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Science', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
  ]},
  { id: 'uni-ae-002', name: 'American University of Sharjah (AUS)', country: 'UAE', city: 'Sharjah', website: 'https://www.aus.edu', type: 'private', foundedYear: 1997, departments: [
    { name: 'School of Engineering', courses: [
      { name: 'BSc Computer Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Business Administration', courses: [
      { name: 'BBA', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Arts and Sciences', courses: [
      { name: 'BA International Relations', degree: 'bachelor', duration: '4 years' },
      { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  // ── IRELAND (2 unis, 2 cities) ──
  { id: 'uni-ie-001', name: 'Trinity College Dublin', country: 'Ireland', city: 'Dublin', website: 'https://www.tcd.ie', type: 'public', foundedYear: 1592, departments: [
    { name: 'Computer Science and Statistics', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '1 year' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'BEng Electronic Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BEng Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Business', courses: [
      { name: 'BBS Business Studies', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '1 year' },
    ]},
  ]},
  { id: 'uni-ie-002', name: 'University College Dublin (UCD)', country: 'Ireland', city: 'Dublin', website: 'https://www.ucd.ie', type: 'public', foundedYear: 1854, departments: [
    { name: 'Computer Science', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Data Analytics', degree: 'master', duration: '1 year' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'BEng Biomedical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BEng Chemical Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Quinn School of Business', courses: [
      { name: 'BComm', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '1 year' },
    ]},
  ]},
  // ── NETHERLANDS (2 unis, 2 cities) ──
  { id: 'uni-nl-001', name: 'Delft University of Technology (TU Delft)', country: 'Netherlands', city: 'Delft', website: 'https://www.tudelft.nl', type: 'public', foundedYear: 1842, departments: [
    { name: 'Computer Science and Engineering', courses: [
      { name: 'BSc Computer Science and Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Aerospace Engineering', courses: [
      { name: 'BSc Aerospace Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Aerospace Engineering', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Civil Engineering and Geosciences', courses: [
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  { id: 'uni-nl-002', name: 'University of Amsterdam (UvA)', country: 'Netherlands', city: 'Amsterdam', website: 'https://www.uva.nl', type: 'public', foundedYear: 1632, departments: [
    { name: 'Informatics', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Artificial Intelligence', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Economics and Business', courses: [
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Finance', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Science', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  // ── NEW ZEALAND (2 unis, 2 cities) ──
  { id: 'uni-nz-001', name: 'University of Auckland', country: 'New Zealand', city: 'Auckland', website: 'https://www.auckland.ac.nz', type: 'public', foundedYear: 1883, departments: [
    { name: 'Computer Science', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'BEng Software Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BEng Civil Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Business School', courses: [
      { name: 'BCom', degree: 'bachelor', duration: '3 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
    ]},
  ]},
  // ── SWEDEN (2 unis, 2 cities) ──
  { id: 'uni-se-001', name: 'KTH Royal Institute of Technology', country: 'Sweden', city: 'Stockholm', website: 'https://www.kth.se', type: 'public', foundedYear: 1827, departments: [
    { name: 'Computer Science and Communication', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'MSc Machine Learning', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Engineering Sciences', courses: [
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Energy Engineering', degree: 'master', duration: '2 years' },
    ]},
  ]},
  // ── SWITZERLAND (2 unis, 2 cities) ──
  { id: 'uni-ch-001', name: 'ETH Zurich', country: 'Switzerland', city: 'Zurich', website: 'https://www.ethz.ch', type: 'public', foundedYear: 1855, departments: [
    { name: 'Computer Science', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Mechanical Engineering', courses: [
      { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Robotics', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Mathematics', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  { id: 'uni-ch-002', name: 'EPFL (Swiss Federal Institute of Technology Lausanne)', country: 'Switzerland', city: 'Lausanne', website: 'https://www.epfl.ch', type: 'public', foundedYear: 1969, departments: [
    { name: 'Computer and Communication Sciences', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Data Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'BSc Microengineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
    ]},
  ]},
  // ── FRANCE (2 unis, 2 cities) ──
  { id: 'uni-fr-001', name: 'Sorbonne University', country: 'France', city: 'Paris', website: 'https://www.sorbonne-universite.fr', type: 'public', foundedYear: 1150, departments: [
    { name: 'Faculty of Science and Engineering', courses: [
      { name: 'Licence Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'Master Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Arts and Humanities', courses: [
      { name: 'Licence Philosophy', degree: 'bachelor', duration: '3 years' },
      { name: 'Licence History', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  { id: 'uni-fr-002', name: 'Paris-Saclay University', country: 'France', city: 'Paris', website: 'https://www.universite-paris-saclay.fr', type: 'public', foundedYear: 2014, departments: [
    { name: 'Computer Science', courses: [
      { name: 'Licence Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'Master Artificial Intelligence', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'Engineering Degree - Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'Engineering Degree - Physics', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  // ── SOUTH AFRICA (1 uni) ──
  { id: 'uni-za-001', name: 'University of Cape Town', country: 'South Africa', city: 'Cape Town', website: 'https://www.uct.ac.za', type: 'public', foundedYear: 1829, departments: [
    { name: 'Computer Science', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'BSc Engineering (Civil)', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Engineering (Electrical)', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Commerce', courses: [
      { name: 'BCom', degree: 'bachelor', duration: '3 years' },
      { name: 'BBA', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  // ── PHILIPPINES (1 uni) ──
  { id: 'uni-ph-001', name: 'University of the Philippines', country: 'Philippines', city: 'Quezon City', website: 'https://www.upd.edu.ph', type: 'public', foundedYear: 1908, departments: [
    { name: 'College of Engineering', courses: [
      { name: 'BS Computer Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BS Electrical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BS Civil Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'College of Science', courses: [
      { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Economics', courses: [
      { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  // ── THAILAND (1 uni) ──
  { id: 'uni-th-001', name: 'Chulalongkorn University', country: 'Thailand', city: 'Bangkok', website: 'https://www.chula.ac.th', type: 'public', foundedYear: 1917, departments: [
    { name: 'Faculty of Engineering', courses: [
      { name: 'BEng Computer Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'BEng Electrical Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Science', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Commerce and Accountancy', courses: [
      { name: 'BBA', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  // ── HUNGARY (1 uni) ──
  { id: 'uni-hu-001', name: 'ELTE Eötvös Loránd University', country: 'Hungary', city: 'Budapest', website: 'https://www.elte.hu', type: 'public', foundedYear: 1635, departments: [
    { name: 'Faculty of Informatics', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Science', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  // ── POLAND (1 uni) ──
  { id: 'uni-pl-001', name: 'University of Warsaw', country: 'Poland', city: 'Warsaw', website: 'https://www.uw.edu.pl', type: 'public', foundedYear: 1816, departments: [
    { name: 'Faculty of Mathematics, Informatics and Mechanics', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Physics', courses: [
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},
  // ── RUSSIA (1 uni) ──
  { id: 'uni-ru-001', name: 'Lomonosov Moscow State University', country: 'Russia', city: 'Moscow', website: 'https://www.msu.ru', type: 'public', foundedYear: 1755, departments: [
    { name: 'Computational Mathematics and Cybernetics', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Mechanics and Mathematics', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  // ── BRAZIL (1 uni) ──
  { id: 'uni-br-001', name: 'University of São Paulo (USP)', country: 'Brazil', city: 'São Paulo', website: 'https://www5.usp.br', type: 'public', foundedYear: 1934, departments: [
    { name: 'Polytechnic School', courses: [
      { name: 'BEng Computer Engineering', degree: 'bachelor', duration: '5 years' },
      { name: 'BEng Electrical Engineering', degree: 'bachelor', duration: '5 years' },
      { name: 'BEng Civil Engineering', degree: 'bachelor', duration: '5 years' },
    ]},
    { name: 'Institute of Mathematics and Statistics', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  // ── EGYPT (1 uni) ──
  { id: 'uni-eg-001', name: 'Cairo University', country: 'Egypt', city: 'Cairo', website: 'https://www.cu.edu.eg', type: 'public', foundedYear: 1908, departments: [
    { name: 'Faculty of Engineering', courses: [
      { name: 'BSc Computer Engineering', degree: 'bachelor', duration: '5 years' },
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '5 years' },
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '5 years' },
    ]},
    { name: 'Faculty of Science', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Economics', courses: [
      { name: 'BSc Economics', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
  // ── SAUDI ARABIA (1 uni) ──
  { id: 'uni-sa-001', name: 'King Abdulaziz University (KAU)', country: 'Saudi Arabia', city: 'Jeddah', website: 'https://www.kau.edu.sa', type: 'public', foundedYear: 1967, departments: [
    { name: 'Computing and IT', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Information Technology', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Engineering', courses: [
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '5 years' },
      { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '5 years' },
    ]},
  ]},
];

async function main() {
  console.log('=== Expanding International University Data ===\n');
  let created = 0, updated = 0, skipped = 0;

  for (const uni of newUniversities) {
    const existing = await prisma.university.findFirst({
      where: { OR: [{ id: uni.id }, { name: { contains: uni.name.split('(')[0].trim(), mode: 'insensitive' } }] },
    });

    if (existing) {
      // University exists — add departments/courses if missing
      const courseCount = await prisma.course.count({ where: { universityId: existing.id } });
      if (courseCount > 0) {
        console.log(`⏭  ${uni.name} — already has ${courseCount} courses, skipping`);
        skipped++;
        continue;
      }
      // Add departments and courses to existing university
      for (const dept of uni.departments) {
        await prisma.department.create({
          data: { universityId: existing.id, name: dept.name, head: '', totalCourses: dept.courses.length },
        });
        for (const c of dept.courses) {
          const currency = currencyMap[uni.country] || 'USD';
          await prisma.course.create({
            data: {
              universityId: existing.id, name: c.name, degree: c.degree,
              department: dept.name, duration: c.duration, language: 'English',
              currency, verificationStatus: 'verified',
            },
          });
        }
      }
      console.log(`✅ ${uni.name} — added ${uni.departments.length} depts (existing uni had no courses)`);
      updated++;
    } else {
      // Create new university with departments and courses
      await prisma.university.create({
        data: {
          id: uni.id, name: uni.name, country: uni.country, city: uni.city,
          website: uni.website, type: uni.type, foundedYear: uni.foundedYear,
          verificationStatus: 'verified',
        },
      });
      for (const dept of uni.departments) {
        await prisma.department.create({
          data: { universityId: uni.id, name: dept.name, head: '', totalCourses: dept.courses.length },
        });
        for (const c of dept.courses) {
          const currency = currencyMap[uni.country] || 'USD';
          await prisma.course.create({
            data: {
              universityId: uni.id, name: c.name, degree: c.degree,
              department: dept.name, duration: c.duration, language: 'English',
              currency, verificationStatus: 'verified',
            },
          });
        }
      }
      const totalCourses = uni.departments.reduce((a, d) => a + d.courses.length, 0);
      console.log(`✅ ${uni.name} (${uni.city}, ${uni.country}) — ${uni.departments.length} depts, ${totalCourses} courses`);
      created++;
    }
  }

  console.log(`\n=== Done! Created: ${created}, Updated: ${updated}, Skipped: ${skipped} ===`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });

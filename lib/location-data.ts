// Shared country / city data used by both UploadForm and PhotoDetail edit mode.
// "other" is always kept at the bottom via the exported `countries` array.

export const locationData: { [key: string]: string[] } = {
  'united states': ['new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver', 'washington dc', 'boston', 'el paso', 'nashville', 'detroit', 'oklahoma city', 'portland', 'las vegas', 'memphis', 'louisville', 'baltimore', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'mesa', 'sacramento', 'atlanta', 'kansas city', 'colorado springs', 'raleigh', 'miami', 'long beach', 'virginia beach', 'omaha', 'oakland', 'minneapolis', 'tulsa', 'wichita', 'new orleans', 'arlington', 'other'],
  'australia': ['sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'gold coast', 'canberra', 'newcastle', 'wollongong', 'logan city', 'geelong', 'hobart', 'townsville', 'cairns', 'darwin', 'toowoomba', 'ballarat', 'bendigo', 'albury', 'launceston', 'other'],
  'austria': ['vienna', 'graz', 'linz', 'salzburg', 'innsbruck', 'klagenfurt', 'villach', 'wels', 'sankt pölten', 'dornbirn', 'other'],
  'belgium': ['brussels', 'antwerp', 'ghent', 'charleroi', 'liège', 'bruges', 'namur', 'leuven', 'mons', 'aalst', 'other'],
  'brazil': ['são paulo', 'rio de janeiro', 'brasília', 'salvador', 'fortaleza', 'belo horizonte', 'manaus', 'curitiba', 'recife', 'porto alegre', 'belém', 'goiânia', 'guarulhos', 'campinas', 'são luís', 'são gonçalo', 'maceió', 'duque de caxias', 'natal', 'campo grande', 'other'],
  'canada': ['toronto', 'montreal', 'vancouver', 'calgary', 'edmonton', 'ottawa', 'winnipeg', 'quebec city', 'hamilton', 'kitchener', 'london', 'victoria', 'halifax', 'oshawa', 'windsor', 'saskatoon', 'regina', 'other'],
  'china': ['beijing', 'shanghai', 'guangzhou', 'shenzhen', 'chengdu', 'tianjin', 'wuhan', 'dongguan', 'chongqing', 'nanjing', 'shenyang', 'hangzhou', "xi'an", 'harbin', 'suzhou', 'qingdao', 'dalian', 'zhengzhou', 'shantou', 'jinan', 'other'],
  'czech republic': ['prague', 'brno', 'ostrava', 'pilsen', 'liberec', 'olomouc', 'české budějovice', 'hradec králové', 'ústí nad labem', 'pardubice', 'other'],
  'denmark': ['copenhagen', 'aarhus', 'odense', 'aalborg', 'frederiksberg', 'esbjerg', 'randers', 'kolding', 'horsens', 'vejle', 'other'],
  'finland': ['helsinki', 'espoo', 'tampere', 'vantaa', 'oulu', 'turku', 'jyväskylä', 'lahti', 'kuopio', 'pori', 'other'],
  'france': ['paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes', 'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'le havre', 'saint-étienne', 'toulon', 'grenoble', 'dijon', 'angers', 'nîmes', 'villeurbanne', 'other'],
  'germany': ['berlin', 'hamburg', 'munich', 'cologne', 'frankfurt', 'stuttgart', 'düsseldorf', 'dortmund', 'essen', 'leipzig', 'bremen', 'dresden', 'hanover', 'nuremberg', 'duisburg', 'bochum', 'wuppertal', 'bielefeld', 'bonn', 'münster', 'other'],
  'greece': ['athens', 'thessaloniki', 'patras', 'heraklion', 'larissa', 'volos', 'rhodes', 'ioannina', 'chania', 'santorini', 'mykonos', 'other'],
  'hong kong': ['hong kong island', 'kowloon', 'new territories', 'lantau island', 'other'],
  'india': ['mumbai', 'delhi', 'bangalore', 'hyderabad', 'ahmedabad', 'chennai', 'kolkata', 'surat', 'pune', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad', 'patna', 'vadodara', 'other'],
  'indonesia': ['jakarta', 'surabaya', 'bandung', 'medan', 'semarang', 'makassar', 'palembang', 'tangerang', 'depok', 'bali', 'yogyakarta', 'manado', 'batam', 'padang', 'other'],
  'ireland': ['dublin', 'cork', 'limerick', 'galway', 'waterford', 'drogheda', 'dundalk', 'swords', 'bray', 'navan', 'other'],
  'italy': ['rome', 'milan', 'naples', 'turin', 'palermo', 'genoa', 'bologna', 'florence', 'bari', 'catania', 'venice', 'verona', 'messina', 'padua', 'trieste', 'brescia', 'parma', 'prato', 'modena', 'reggio calabria', 'other'],
  'japan': ['tokyo', 'yokohama', 'osaka', 'nagoya', 'sapporo', 'fukuoka', 'kobe', 'kyoto', 'kawasaki', 'saitama', 'hiroshima', 'sendai', 'chiba', 'kitakyushu', 'sakai', 'niigata', 'hamamatsu', 'shizuoka', 'sagamihara', 'okayama', 'other'],
  'malaysia': ['kuala lumpur', 'george town', 'ipoh', 'shah alam', 'petaling jaya', 'johor bahru', 'malacca city', 'kota kinabalu', 'kuching', 'kota bharu', 'kuantan', 'other'],
  'mexico': ['mexico city', 'guadalajara', 'monterrey', 'puebla', 'tijuana', 'león', 'juárez', 'zapopan', 'mérida', 'san luis potosí', 'aguascalientes', 'hermosillo', 'saltillo', 'mexicali', 'culiacán', 'cancún', 'other'],
  'netherlands': ['amsterdam', 'rotterdam', 'the hague', 'utrecht', 'eindhoven', 'groningen', 'tilburg', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem', 'zaanstad', 'amersfoort', 'other'],
  'new zealand': ['auckland', 'wellington', 'christchurch', 'hamilton', 'tauranga', 'dunedin', 'palmerston north', 'napier', 'other'],
  'norway': ['oslo', 'bergen', 'stavanger', 'trondheim', 'drammen', 'fredrikstad', 'kristiansand', 'tromsø', 'sandnes', 'ålesund', 'other'],
  'philippines': ['manila', 'quezon city', 'cebu city', 'davao', 'caloocan', 'zamboanga', 'antipolo', 'pasig', 'taguig', 'cagayan de oro', 'palawan', 'boracay', 'other'],
  'portugal': ['lisbon', 'porto', 'braga', 'amadora', 'setúbal', 'coimbra', 'funchal', 'almada', 'aveiro', 'guimarães', 'faro', 'other'],
  'singapore': ['singapore', 'other'],
  'south korea': ['seoul', 'busan', 'incheon', 'daegu', 'daejeon', 'gwangju', 'suwon', 'ulsan', 'other'],
  'spain': ['madrid', 'barcelona', 'valencia', 'seville', 'zaragoza', 'málaga', 'murcia', 'palma', 'las palmas', 'bilbao', 'alicante', 'córdoba', 'valladolid', 'vigo', 'gijón', 'granada', 'san sebastián', 'toledo', 'salamanca', 'ibiza', 'other'],
  'sweden': ['stockholm', 'gothenburg', 'malmö', 'uppsala', 'västerås', 'örebro', 'linköping', 'helsingborg', 'jönköping', 'norrköping', 'other'],
  'switzerland': ['zurich', 'geneva', 'basel', 'bern', 'lausanne', 'winterthur', 'lucerne', 'st. gallen', 'lugano', 'interlaken', 'other'],
  'taiwan': ['taipei', 'new taipei', 'taichung', 'kaohsiung', 'tainan', 'hsinchu', 'keelung', 'jiufen', 'taroko', 'other'],
  'thailand': ['bangkok', 'chiang mai', 'phuket', 'pattaya', 'krabi', 'ayutthaya', 'chiang rai', 'hua hin', 'koh samui', 'other'],
  'turkey': ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya', 'adana', 'konya', 'gaziantep', 'mersin', 'cappadocia', 'bodrum', 'other'],
  'united kingdom': ['london', 'birmingham', 'manchester', 'glasgow', 'liverpool', 'leeds', 'sheffield', 'edinburgh', 'bristol', 'cardiff', 'belfast', 'leicester', 'nottingham', 'newcastle', 'southampton', 'oxford', 'cambridge', 'brighton', 'york', 'bath', 'other'],
  'vietnam': ['ho chi minh city', 'hanoi', 'da nang', 'nha trang', 'hoi an', 'hue', 'can tho', 'vung tau', 'other'],
  'other': ['other'],
}

// Alphabetically sorted A–Z, with "other" pinned permanently at the bottom.
export const countries: string[] = [
  ...Object.keys(locationData)
    .filter((c) => c !== 'other')
    .sort(),
  'other',
]

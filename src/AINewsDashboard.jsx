import React, { useState, useMemo, useEffect } from 'react';
import { RefreshCw, Filter, ExternalLink, Star, Settings, Plus, Search, Send, X, AlertCircle } from 'lucide-react';

// Простые компоненты Alert (вместо внешних)
const Alert = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-white p-4 ${className}`}>
    {children}
  </div>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm text-gray-600">{children}</div>
);

// Реальные новости за 5-11 ноября 2025 (обновлено 12.11.2025)
const DEMO_NEWS = [
  {
    id: 1,
    date: '2025-11-11',
    title: 'AI-стартап Tsavorite получил более $100 млн предзаказов на свой Omni Processing Unit',
    description: 'Tsavorite заявляет, что их Omni Processing Unit объединяет CPU, GPU, память и интерконнект в одном устройстве для AI и дата-центров нового поколения. Крупные предзаказы сигнализируют о спросе на конвергентное оборудование.',
    importance: 'Ускоряет вычисления за счет унификации вычислительных компонентов в едином чипе, снижая задержки и повышая производительность AI-кластеров.',
    tags: ['GPU', 'CPU', 'Архитектура', 'Память'],
    region: 'Глобальный',
    source: 'https://www.datacenterdynamics.com/en/news/ai-chip-startup-tsavorite-secures-more-than-100m-in-pre-orders-for-its-omni-processing-unit/',
    starred: false,
    priority: 'ускорение'
  },
  {
    id: 2,
    date: '2025-11-11',
    title: 'Дата-центры Кремниевой долины простаивают в ожидании энергоподключения',
    description: 'Ограничения энергосетей оставили новые объекты в Кремниевой долине неиспользуемыми, подчеркивая энергоснабжение как ключевой ограничивающий фактор для роста AI-инфраструктуры в регионе.',
    importance: 'Повышает критичность энергоэффективности инфраструктуры - дефицит электроэнергии становится главным барьером для масштабирования AI-вычислений.',
    tags: ['Энергетика', 'Дата-центры'],
    region: 'США',
    source: 'https://www.datacenterdynamics.com/en/news/silicon-valley-data-centers-stand-empty-awaiting-power-connections-report/',
    starred: false,
    priority: 'эффективность'
  },
  {
    id: 3,
    date: '2025-11-11',
    title: 'Nebius подписал контракт с Meta на $3 млрд, текущие мощности полностью распроданы',
    description: 'Европейский облачный провайдер Nebius заключил многомиллиардный контракт с Meta, сообщив о полной загрузке мощностей и планах расширения до 2.5 ГВт к концу 2026 года.',
    importance: 'Ускоряет вычисления через масштабное расширение европейской AI-инфраструктуры с амбициозными планами роста мощностей в 2.5 ГВт.',
    tags: ['Дата-центры', 'Энергетика'],
    region: 'Европа',
    source: 'https://www.datacenterdynamics.com/en/news/nebius-signs-3bn-deal-with-meta-says-current-available-capacity-is-sold-out-as-it-targets-25gw-by-end-of-2026/',
    starred: false,
    priority: 'ускорение'
  },
  {
    id: 4,
    date: '2025-11-11',
    title: 'Microsoft расширяет Azure Local, добавляя серверы Nvidia для суверенного AI',
    description: 'Microsoft масштабирует суверенные облачные регионы, развертывая дополнительные серверы Nvidia для поддержки безопасных AI-моделей. AWS одновременно детализирует свою стратегию European Sovereign Cloud.',
    importance: 'Повышает эффективность инфраструктуры через суверенные облачные решения, обеспечивающие соответствие локальным требованиям и безопасность данных.',
    tags: ['GPU', 'Дата-центры', 'Архитектура'],
    region: 'Европа',
    source: 'https://www.datacenterdynamics.com/en/news/microsoft-expands-azure-local-offering-adds-nvidia-servers-for-sovereign-ai/',
    starred: false,
    priority: 'эффективность'
  },
  {
    id: 5,
    date: '2025-11-11',
    title: 'CoreWeave: портфель заказов в Q3 удвоился до $55.6 млрд',
    description: 'CoreWeave, ведущий AI-облачный провайдер, сообщает о быстром росте портфеля заказов, при этом задержки в вводе дата-центров названы ключевым узким местом для гипермасштабного развертывания AI.',
    importance: 'Ускоряет вычисления через масштабирование облачной AI-инфраструктуры, но выявляет критический дефицит мощностей дата-центров.',
    tags: ['Дата-центры', 'GPU'],
    region: 'США',
    source: 'https://www.datacenterdynamics.com/en/news/coreweave-q3-earnings-show-revenue-backlog-doubled-to-556bn/',
    starred: false,
    priority: 'ускорение'
  },
  {
    id: 6,
    date: '2025-11-11',
    title: 'AI-дата-центр планируется на месте полигона в Дербишире, Великобритания',
    description: 'Модульный AI-дата-центр с пятью подами планируется построить на месте полигона в Дербишире, отражая новые подходы к интеграции инфраструктуры с нестандартной недвижимостью.',
    importance: 'Повышает эффективность инфраструктуры через использование альтернативных площадок, снижая затраты на землю и ускоряя развертывание.',
    tags: ['Дата-центры', 'Архитектура'],
    region: 'Европа',
    source: 'https://www.datacenterdynamics.com/en/news/ai-data-center-planned-for-landfill-site-in-derbyshire-uk/',
    starred: false,
    priority: 'эффективность'
  },
  {
    id: 7,
    date: '2025-11-10',
    title: 'Исследователь Duke Тайлер Норрис назначен главой инноваций Google по энергетике',
    description: 'Тайлер Норрис, известный исследованиями гибкости энергоснабжения дата-центров, присоединяется к Google для руководства передовыми энергетическими инициативами инфраструктуры и устойчивости.',
    importance: 'Повышает эффективность инфраструктуры через развитие передовых энергетических технологий для устойчивых дата-центров.',
    tags: ['Энергетика', 'Дата-центры'],
    region: 'США',
    source: 'https://www.datacenterdynamics.com/en/news/duke-researcher-tyler-norris-named-googles-head-of-market-innovation-advanced-energy/',
    starred: false,
    priority: 'эффективность'
  },
  {
    id: 8,
    date: '2025-11-10',
    title: 'RAAAM Memory привлекла $17.5 млн на разработку энергоэффективных чипов',
    description: 'RAAAM получает крупное финансирование для разработки специализированных чипов памяти для энергоэффективных AI-серверов в сотрудничестве с NXP Semiconductors, нацеливаясь на оптимизацию энергопотребления.',
    importance: 'Повышает эффективность инфраструктуры за счет разработки низкопотребляющей памяти, критичной для снижения энергозатрат AI-кластеров.',
    tags: ['Память', 'Энергетика'],
    region: 'США',
    source: 'https://www.datacenterdynamics.com/en/news/raaam-memory-technologies-raises-175m-for-development-of-low-power-chips/',
    starred: false,
    priority: 'эффективность'
  },
  {
    id: 9,
    date: '2025-11-10',
    title: 'Du и NextGenAI запускают кластер Nvidia B300 мощностью 13 МВт в ОАЭ',
    description: 'Du и NextGenAI анонсируют новый AI-кластер на 13 МВт на базе GPU Nvidia B300 в дата-центре Дубая, что знаменует одно из крупнейших развертываний машинного обучения в регионе.',
    importance: 'Ускоряет вычисления через развертывание передовых GPU Nvidia B300 в регионе Персидского залива для масштабных AI-задач.',
    tags: ['GPU', 'Дата-центры', 'Энергетика'],
    region: 'Азия',
    source: 'https://www.datacenterdynamics.com/en/news/du-and-nextgenai-partner-for-13mw-nvidia-b300-deployment-in-uae/',
    starred: false,
    priority: 'ускорение'
  },
  {
    id: 10,
    date: '2025-11-10',
    title: 'Deep Green планирует экспансию в США, объявляет о 24 МВт дата-центре в Мичигане',
    description: 'Британская Deep Green Group расширяется в США с планами 24 МВт AI-готового дата-центра в Мичигане, сигнализируя о растущих трансатлантических инвестициях в инфраструктуру для AI-вычислений.',
    importance: 'Ускоряет вычисления через трансатлантические инвестиции в новое поколение AI-инфраструктуры с фокусом на готовность к высокоплотным нагрузкам.',
    tags: ['Дата-центры', 'Энергетика'],
    region: 'США',
    source: 'https://www.datacenterdynamics.com/en/news/deep-green-plots-us-expansion-announces-24mw-data-center-in-michigan/',
    starred: false,
    priority: 'ускорение'
  }
];

const ALL_TAGS = ['GPU', 'CPU', 'Охлаждение', 'Интерконнект', 'Архитектура', 'Энергетика', 'Дата-центры', 'Память', 'Хранилище'];
const ALL_REGIONS = ['Глобальный', 'США', 'Китай', 'Россия', 'Европа', 'Азия'];
const PRIORITIES = [
  { id: 'замещение', label: 'Замещение санкционных технологий' },
  { id: 'эффективность', label: 'Эффективность инфраструктуры' },
  { id: 'ускорение', label: 'Ускорение вычислений' }
];
// Нормализация региона из ответа Perplexity к нашим значениям
const normalizeRegion = (rawRegion) => {
  if (!rawRegion) return 'Глобальный';
  const value = String(rawRegion).toLowerCase();

  if (value.includes('us') || value.includes('united states') || value.includes('america')) {
    return 'США';
  }
  if (value.includes('eu') || value.includes('europe')) {
    return 'Европа';
  }
  if (value.includes('asia') || value.includes('uae') || value.includes('dubai') || value.includes('singapore') || value.includes('china')) {
    return 'Азия';
  }
  if (value.includes('russia') || value.includes('росс')) {
    return 'Россия';
  }
  if (value.includes('china')) {
    return 'Китай';
  }

  return 'Глобальный';
};

// Нормализация приоритета
const normalizePriority = (rawPriority) => {
  if (!rawPriority) return 'эффективность';
  const value = String(rawPriority).toLowerCase();

  if (value.includes('замещ') || value.includes('substitut')) {
    return 'замещение';
  }
  if (value.includes('ускор') || value.includes('accel')) {
    return 'ускорение';
  }
  if (value.includes('эффект') || value.includes('efficien')) {
    return 'эффективность';
  }

  return 'эффективность';
};

// Автодобавление тегов по тексту, если Perplexity не прислал
const inferTags = (tags, title = '', description = '') => {
  if (Array.isArray(tags) && tags.length > 0) return tags;

  const text = `${title} ${description}`.toLowerCase();
  const result = new Set();

  if (text.includes('gpu') || text.includes('nvidia') || text.includes('h100') || text.includes('b300') || text.includes('b200')) {
    result.add('GPU');
  }
  if (text.includes('cpu') || text.includes('x86') || text.includes('arm')) {
    result.add('CPU');
  }
  if (text.includes('cooling') || text.includes('liquid') || text.includes('охлаж')) {
    result.add('Охлаждение');
  }
  if (text.includes('interconnect') || text.includes('infiniband') || text.includes('nvlink')) {
    result.add('Интерконнект');
  }
  if (text.includes('data center') || text.includes('data-centre') || text.includes('дата-центр') || text.includes('datacenter')) {
    result.add('Дата-центры');
  }
  if (text.includes('energy') || text.includes('мегават') || text.includes('mw') || text.includes('гвт') || text.includes('power')) {
    result.add('Энергетика');
  }
  if (text.includes('memory') || text.includes('hbm') || text.includes('dram') || text.includes('память')) {
    result.add('Память');
  }
  if (text.includes('storage') || text.includes('nvme') || text.includes('ssd') || text.includes('хранилищ')) {
    result.add('Хранилище');
  }

  if (result.size === 0) {
    result.add('Дата-центры');
  }

  return Array.from(result);
};

// Преобразование content от Perplexity к строке
const extractContentText = (rawContent) => {
  if (!rawContent) return '';

  // Вариант 1: строка
  if (typeof rawContent === 'string') {
    return rawContent;
  }

  // Вариант 2: массив блоков (часто так делают новые API)
  if (Array.isArray(rawContent)) {
    return rawContent
      .map((block) => {
        if (typeof block === 'string') return block;
        if (block && typeof block.text === 'string') return block.text;
        if (block && typeof block.content === 'string') return block.content;
        return '';
      })
      .join('\n')
      .trim();
  }

  // Вариант 3: объект с text/content
  if (typeof rawContent === 'object') {
    if (typeof rawContent.text === 'string') return rawContent.text;
    if (typeof rawContent.content === 'string') return rawContent.content;
  }

  console.warn('⚠️ Неизвестный формат content от Perplexity:', rawContent);
  return '';
};

export default function AINewsDashboard() {
  const [lastSearchInfo, setLastSearchInfo] = useState(null);
  const [news, setNews] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // Настройки API
  const [settings, setSettings] = useState({
    perplexityApiKey: '',
    telegramBotToken: '',
    telegramChatId: ''
  });
  
  // Форма добавления новости
  const [newNewsForm, setNewNewsForm] = useState({
    title: '',
    description: '',
    importance: '',
    tags: [],
    region: 'Глобальный',
    source: '',
    priority: 'эффективность'
  });

  // Инициализация при загрузке
  useEffect(() => {
    // Проверка авторизации
    const authToken = localStorage.getItem('adminAuth');
    const authExpiry = localStorage.getItem('adminAuthExpiry');
    
    if (authToken === 'true' && authExpiry) {
      const expiryDate = new Date(authExpiry);
      if (expiryDate > new Date()) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminAuthExpiry');
      }
    }

    // Загрузка новостей
    const savedNews = localStorage.getItem('aiNewsPortal');
    if (savedNews) {
      setNews(JSON.parse(savedNews));
    } else {
      setNews(DEMO_NEWS);
      localStorage.setItem('aiNewsPortal', JSON.stringify(DEMO_NEWS));
    }

    // Загрузка настроек
    const savedSettings = localStorage.getItem('aiNewsSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    setIsLoading(false);
  }, []);

  // Фильтрация новостей
  const filteredNews = useMemo(() => {
    let filtered = [...news];

    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        item.tags.some(tag => selectedTags.includes(tag))
      );
    }

    if (selectedRegions.length > 0) {
      filtered = filtered.filter(item =>
        selectedRegions.includes(item.region)
      );
    }

    if (selectedPriorities.length > 0) {
      filtered = filtered.filter(item =>
        selectedPriorities.includes(item.priority)
      );
    }

    if (showStarredOnly) {
      filtered = filtered.filter(item => item.starred);
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [news, selectedTags, selectedRegions, selectedPriorities, showStarredOnly]);

  // Авторизация
  const handleAuth = () => {
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminAuthExpiry', expiryDate.toISOString());
      setShowPasswordModal(false);
      setPasswordInput('');
    } else {
      alert('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthExpiry');
  };

  // Переключение избранного
  const toggleStar = (id) => {
    if (!isAuthenticated) {
      setShowPasswordModal(true);
      return;
    }

    const updatedNews = news.map(item =>
      item.id === id ? { ...item, starred: !item.starred } : item
    );
    setNews(updatedNews);
    localStorage.setItem('aiNewsPortal', JSON.stringify(updatedNews));
  };

  // Сохранение настроек
  const saveSettings = () => {
    localStorage.setItem('aiNewsSettings', JSON.stringify(settings));
    alert('Настройки сохранены!');
    setShowSettings(false);
  };

  // Добавление новости
  const handleAddNews = () => {
    if (!newNewsForm.title || !newNewsForm.description) {
      alert('Заполните обязательные поля');
      return;
    }

    const newItem = {
      ...newNewsForm,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      starred: false
    };

    const updatedNews = [newItem, ...news];
    setNews(updatedNews);
    localStorage.setItem('aiNewsPortal', JSON.stringify(updatedNews));
    
    setNewNewsForm({
      title: '',
      description: '',
      importance: '',
      tags: [],
      region: 'Глобальный',
      source: '',
      priority: 'эффективность'
    });
    setShowAddNews(false);
    alert('Новость добавлена!');
  };

  // Поиск новостей через Perplexity
  // Поиск новостей через Perplexity
const searchNews = async () => {
  if (!settings.perplexityApiKey) {
    alert('Сначала добавьте Perplexity API ключ в настройках');
    setShowSettings(true);
    return;
  }

  setIsSearching(true);
  setSearchError(null);
  setLastSearchInfo(null);

  const prompt = `Найди 5 последних важных новостей об AI-инфраструктуре за последние 7 дней.

Категории для поиска:
- GPU и AI-ускорители (Nvidia H100/H200/B200, AMD MI300, Intel Gaudi)
- Дата-центры и их энергопотребление
- Системы охлаждения для AI-кластеров
- Интерконнект и сетевые технологии (InfiniBand, NVLink)
- Архитектуры AI-систем
- Память и хранилища для AI

Для каждой новости верни ТОЛЬКО валидный JSON в формате:
[
  {
    "title": "Заголовок новости на русском",
    "description": "Описание 2-3 предложения",
    "importance": "Почему это важно для AI-инфраструктуры",
    "tags": ["GPU", "Дата-центры"],
    "region": "США/Европа/Азия/Россия/Глобальный",
    "source": "URL источника",
    "priority": "ускорение/эффективность/замещение"
  }
]

ВАЖНО: Верни ТОЛЬКО JSON массив, без markdown и комментариев.`;

  try {
    console.log('🔍 Начинаю поиск через Perplexity API...');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.perplexityApiKey}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по AI-инфраструктуре. Возвращай только валидный JSON без markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'week',
        return_images: false,
        return_related_questions: false,
        search_domain_filter: [
          'datacenterdynamics.com',
          'hpcwire.com',
          'tomshardware.com',
          'anandtech.com'
        ],
        max_tokens: 4000
      })
    });

    console.log('📡 Получен ответ от API, статус:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Ошибка API:', errorData);
      throw new Error(`Ошибка API: ${response.status} - ${errorData.error?.message || 'Неизвестная ошибка'}`);
    }

    const data = await response.json();
    console.log('📦 Данные получены от Perplexity:', data);

    const rawContent = data?.choices?.[0]?.message?.content;
    console.log('📝 Raw content от Perplexity:', rawContent);

    const content = extractContentText(rawContent);

    if (!content) {
      throw new Error('Пустой ответ от Perplexity API (content отсутствует)');
    }

    console.log('📝 Текст для парсинга:', content);

    // Убираем возможные блоки ```json ... ```
    let cleanContent = content
      .replace(/```json[\s\n]*/gi, '')
      .replace(/```[\s\n]*/g, '')
      .trim();

    // Пытаемся найти JSON массив
    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('❌ JSON массив не найден в ответе Perplexity:', cleanContent);
      throw new Error('JSON массив не найден в ответе Perplexity');
    }

    let newsData;
    try {
      newsData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('❌ Ошибка парсинга JSON:', e);
      console.error('Исходный JSON-текст:', jsonMatch[0]);
      throw new Error('Не удалось распарсить JSON от Perplexity');
    }

    console.log('✅ JSON успешно распарсен:', newsData);

    if (!Array.isArray(newsData) || newsData.length === 0) {
      throw new Error('Perplexity вернул пустой список новостей');
    }

    // Валидация + нормализация + дедупликация
    const existingSources = new Set(
      news
        .filter((n) => typeof n.source === 'string' && n.source)
        .map((n) => n.source.trim())
    );

    const validNews = [];
    const skipped = [];

    newsData.forEach((item) => {
      const base = {
        title: item?.title?.toString().trim(),
        description: item?.description?.toString().trim(),
        importance: (item?.importance || 'Важная новость для AI-инфраструктуры').toString().trim(),
        source: item?.source?.toString().trim(),
      };

      const isValid = base.title && base.description && base.source;

      if (!isValid) {
        console.warn('⚠️ Пропущена невалидная новость (нет title/description/source):', item);
        skipped.push({ reason: 'invalid', item });
        return;
      }

      if (existingSources.has(base.source)) {
        console.warn('⚠️ Пропущен дубликат по source:', base.source);
        skipped.push({ reason: 'duplicate', item });
        return;
      }

      const normalizedRegion = normalizeRegion(item.region);
      const normalizedPriority = normalizePriority(item.priority);
      const normalizedTags = inferTags(item.tags, base.title, base.description);

      validNews.push({
        ...base,
        tags: normalizedTags,
        region: normalizedRegion,
        priority: normalizedPriority,
        id: Date.now() + validNews.length,
        date: new Date().toISOString().split('T')[0],
        starred: false
      });
    });

    if (validNews.length === 0) {
      throw new Error('Не найдено валидных новых новостей (всё либо дубликаты, либо без обязательных полей)');
    }

    console.log(`✅ Обработано новостей: добавлено ${validNews.length}, пропущено ${skipped.length}`);

    const updatedNews = [...validNews, ...news];
    setNews(updatedNews);
    localStorage.setItem('aiNewsPortal', JSON.stringify(updatedNews));

    setLastSearchInfo({
      time: new Date().toISOString(),
      added: validNews.length,
      skipped: skipped.length
    });

    alert(`✅ Успешно добавлено ${validNews.length} новостей! (пропущено: ${skipped.length})`);
  } catch (error) {
    console.error('❌ Ошибка поиска:', error);
    setSearchError(error.message);
    alert(`❌ Ошибка: ${error.message}`);
  } finally {
    setIsSearching(false);
  }
};

  // Отправка в Telegram
  const sendToTelegram = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      alert('Настройте Telegram в настройках');
      setShowSettings(true);
      return;
    }

    const starredNews = news.filter(n => n.starred);
    if (starredNews.length === 0) {
      alert('Нет отмеченных новостей для отправки');
      return;
    }

    const message = `📰 *Дайджест AI-инфраструктуры*\n\n${starredNews.map((n, i) => 
      `${i + 1}. *${n.title}*\n${n.description}\n🔗 ${n.source}`
    ).join('\n\n')}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      if (response.ok) {
        alert('Дайджест отправлен в Telegram!');
      } else {
        throw new Error('Ошибка отправки');
      }
    } catch (error) {
      alert('Ошибка отправки в Telegram');
    }
  };

  // Обновление
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      alert('Данные обновлены');
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Загрузка портала...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Модальное окно авторизации */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Вход для администратора</h3>
            <input
              type="password"
              placeholder="Введите пароль"
              className="w-full px-3 py-2 border rounded-lg mb-4"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAuth}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Войти
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно настроек */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Настройки API</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Perplexity API Key</label>
                <input
                  type="password"
                  placeholder="pplx-..."
                  className="w-full px-3 py-2 border rounded-lg"
                  value={settings.perplexityApiKey}
                  onChange={(e) => setSettings({...settings, perplexityApiKey: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Получить на: <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">perplexity.ai/settings/api</a>
                </p>
                <p className="text-xs text-green-600 mt-1">
                  💰 $5 бесплатно при регистрации (хватит на ~1000 поисков)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telegram Bot Token (опционально)</label>
                <input
                  type="password"
                  placeholder="123456:ABC-DEF..."
                  className="w-full px-3 py-2 border rounded-lg"
                  value={settings.telegramBotToken}
                  onChange={(e) => setSettings({...settings, telegramBotToken: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telegram Chat ID (опционально)</label>
                <input
                  type="text"
                  placeholder="-1001234567890"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={settings.telegramChatId}
                  onChange={(e) => setSettings({...settings, telegramChatId: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={saveSettings}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Сохранить настройки
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления новости */}
      {showAddNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Добавить новость</h3>
              <button
                onClick={() => setShowAddNews(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Заголовок *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newNewsForm.title}
                  onChange={(e) => setNewNewsForm({...newNewsForm, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Описание *</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  value={newNewsForm.description}
                  onChange={(e) => setNewNewsForm({...newNewsForm, description: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Важность для R&D</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                  value={newNewsForm.importance}
                  onChange={(e) => setNewNewsForm({...newNewsForm, importance: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Источник (URL)</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newNewsForm.source}
                  onChange={(e) => setNewNewsForm({...newNewsForm, source: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Теги</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const tags = newNewsForm.tags.includes(tag)
                          ? newNewsForm.tags.filter(t => t !== tag)
                          : [...newNewsForm.tags, tag];
                        setNewNewsForm({...newNewsForm, tags});
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        newNewsForm.tags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Регион</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={newNewsForm.region}
                    onChange={(e) => setNewNewsForm({...newNewsForm, region: e.target.value})}
                  >
                    {ALL_REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Приоритет</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={newNewsForm.priority}
                    onChange={(e) => setNewNewsForm({...newNewsForm, priority: e.target.value})}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAddNews}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Добавить новость
              </button>
              <button
                onClick={() => setShowAddNews(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 AI Infrastructure News Portal
          </h1>
          <p className="text-gray-600">
            Мониторинг новостей о GPU, дата-центрах и AI-инфраструктуре
          </p>
        </div>

        {isAuthenticated && (
          <>
            {/* Панель управления */}
            <div className="bg-white rounded-lg shadow-md mb-6 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                    ✅ Администратор
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    Выйти
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={searchNews}
                    disabled={isSearching}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                    {isSearching ? 'Поиск новостей...' : '🔍 Найти новости'}
                  </button>
                  
                  <button
                    onClick={() => setShowAddNews(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Добавить
                  </button>
                  
                  <button
                    onClick={sendToTelegram}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Send className="w-4 h-4" />
                    Telegram
                  </button>
                  
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <Settings className="w-4 h-4" />
                    Настройки
                  </button>
                </div>
              </div>
              
              {searchError && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Ошибка поиска: {searchError}
                  </AlertDescription>
                </Alert>
              )}
              
              {isSearching && (
                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">
                    <RefreshCw className="w-4 h-4 inline mr-2 animate-spin" />
                    Ищу свежие новости через Perplexity API...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* Панель фильтров */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Фильтры
                  {(selectedTags.length > 0 || selectedRegions.length > 0 || selectedPriorities.length > 0) && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {selectedTags.length + selectedRegions.length + selectedPriorities.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setShowStarredOnly(!showStarredOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showStarredOnly
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${showStarredOnly ? 'fill-current' : ''}`} />
                  Избранное
                  {news.filter(n => n.starred).length > 0 && (
                    <span className="ml-1 text-sm">({news.filter(n => n.starred).length})</span>
                  )}
                </button>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Обновить
              </button>
            </div>

            {/* Развернутые фильтры */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t">
                {/* Теги */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Категории</h3>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Регионы */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Регионы</h3>
                  <div className="flex flex-wrap gap-2">
                    {ALL_REGIONS.map(region => (
                      <button
                        key={region}
                        onClick={() => {
                          setSelectedRegions(prev =>
                            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedRegions.includes(region)
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Приоритеты */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Приоритет R&D</h3>
                  <div className="flex flex-wrap gap-2">
                    {PRIORITIES.map(priority => (
                      <button
                        key={priority.id}
                        onClick={() => {
                          setSelectedPriorities(prev =>
                            prev.includes(priority.id) 
                              ? prev.filter(p => p !== priority.id) 
                              : [...prev, priority.id]
                          );
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          selectedPriorities.includes(priority.id)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Кнопка сброса */}
                <div className="flex justify-end">
                  {(selectedTags.length > 0 || selectedRegions.length > 0 || selectedPriorities.length > 0) && (
                    <button
                      onClick={() => {
                        setSelectedTags([]);
                        setSelectedRegions([]);
                        setSelectedPriorities([]);
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Сбросить все фильтры
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Показано новостей: <span className="font-semibold text-gray-900">{filteredNews.length}</span> из {news.length}
          </p>
          <p className="text-sm text-gray-600">
            Отмечено: <span className="font-semibold text-gray-900">{news.filter(n => n.starred).length}</span>
          </p>
        </div>

        {/* Список новостей */}
        {filteredNews.length === 0 ? (
          <Alert>
            <AlertDescription>
              По выбранным фильтрам новостей не найдено. Попробуйте изменить параметры фильтрации.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {filteredNews.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm border transition-all ${
                  item.starred ? 'border-yellow-400 shadow-md' : 'border-gray-200 hover:shadow-md'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Чекбокс избранного */}
                    <button
                      onClick={() => toggleStar(item.id)}
                      className={`flex-shrink-0 mt-1 transition-colors ${
                        item.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                      } ${!isAuthenticated ? 'cursor-pointer' : ''}`}
                      title={!isAuthenticated ? 'Нажмите для авторизации' : item.starred ? 'Убрать из избранного' : 'Добавить в избранное'}
                    >
                      <Star className={`w-6 h-6 ${item.starred ? 'fill-current' : ''}`} />
                    </button>

                    {/* Контент */}
                    <div className="flex-1 min-w-0">
                      {/* Заголовок и дата */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <a
                            href={item.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors group block"
                          >
                            {item.title}
                          </a>
                          <a
                            href={item.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 mt-1"
                          >
                            {new URL(item.source).hostname.replace('www.', '')}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="flex-shrink-0 text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Описание */}
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Важность для R&D */}
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                        <p className="text-sm text-blue-900">
                          <span className="font-semibold">Почему это важно:</span> {item.importance}
                        </p>
                      </div>

                      {/* Теги и регион */}
                      <div className="flex flex-wrap items-center gap-2">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          📍 {item.region}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Футер */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">🚀 Возможности системы:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <strong>🔍 Автопоиск:</strong> Perplexity AI с веб-поиском находит свежие новости об AI-инфраструктуре
            </div>
            <div>
              <strong>💾 Единая БД:</strong> Все новости сохраняются локально и доступны всем пользователям
            </div>
            <div>
              <strong>📱 Telegram:</strong> Отправка дайджестов выделенных новостей в ваш Telegram
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-600">
              {isAuthenticated ? (
                <span className="text-green-600">
                  ✅ <strong>Авторизован:</strong> Сессия действительна 30 дней. Для выхода нажмите кнопку "Выйти" в панели управления.
                </span>
              ) : (
                <span className="text-blue-600">
                  👀 <strong>Режим гостя:</strong> Вы можете просматривать новости и использовать фильтры. 
                  Поиск, добавление и выделение новостей доступны только администратору.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

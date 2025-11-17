import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Filter, ExternalLink, Star, Settings, Plus, Search, Send, X, AlertCircle, Rss } from 'lucide-react';
import { newsAPI, authAPI, settingsAPI } from './services/api';

const ALL_TAGS = ['GPU', 'CPU', 'Охлаждение', 'Интерконнект', 'Архитектура', 'Энергетика', 'Дата-центры', 'Память', 'Хранилище'];
const ALL_REGIONS = ['Глобальный', 'США', 'Китай', 'Россия', 'Европа', 'Азия'];
const PRIORITIES = [
  { id: 'замещение', label: 'Замещение' },
  { id: 'эффективность', label: 'Эффективность' },
  { id: 'ускорение', label: 'Ускорение' }
];

// Полный список RSS-лент
const RSS_FEEDS = [
  { url: 'https://nvidianews.nvidia.com/releases.xml', region: 'Глобальный' },
  { url: 'https://feeds.feedburner.com/nvidiablog', region: 'Глобальный' },
  { url: 'https://developer.nvidia.com/blog/feed', region: 'Глобальный' },
  { url: 'https://blogs.nvidia.com/blog/category/ai/feed/', region: 'Глобальный' },
  { url: 'https://blog.google/products/google-cloud/rss/', region: 'Глобальный' },
  { url: 'https://aws.amazon.com/blogs/hpc/feed/', region: 'Глобальный' },
  { url: 'https://feeds.feedburner.com/intelnewsroom', region: 'Глобальный' },
  { url: 'https://ir.amd.com/news-events/press-releases/rss', region: 'Глобальный' },
  { url: 'https://newsroom.ibm.com/press-releases-artificial-intelligence?pagetemplate=rss', region: 'Глобальный' },
  { url: 'https://www.huawei.com/en/rss-feeds/huawei-updates/rss', region: 'Глобальный' },
  { url: 'https://www.hpcwire.com/feed/', region: 'Глобальный' },
  { url: 'https://insidehpc.com/feed/', region: 'Глобальный' },
  { url: 'https://www.top500.org/news/feed', region: 'Глобальный' },
  { url: 'https://www.nextplatform.com/feed/', region: 'Глобальный' },
  { url: 'http://feeds.feedburner.com/hpcnotes', region: 'Глобальный' },
  { url: 'https://www.datacenterdynamics.com/rss/', region: 'Глобальный' },
  { url: 'https://www.datacenterknowledge.com/feed/', region: 'Глобальный' },
  { url: 'https://blocksandfiles.com/feed/', region: 'Глобальный' },
  { url: 'https://www.datacenterfrontier.com/feed/', region: 'Глобальный' },
  { url: 'https://www.pugetsystems.com/feed/', region: 'Глобальный' },
  { url: 'https://www.theregister.com/on_prem/hpc/headlines.atom', region: 'Глобальный' },
  { url: 'https://feeds.feedburner.com/serverwatch', region: 'Глобальный' },
  { url: 'https://www.tomshardware.com/feeds/all', region: 'США' },
  { url: 'https://www.anandtech.com/rss/', region: 'США' },
  { url: 'https://www.techpowerup.com/rss/news.xml', region: 'США' },
  { url: 'https://servernews.ru/rss/', region: 'Россия' },
  { url: 'https://ixbt.com/export/news.rss', region: 'Россия' },
  { url: 'https://3dnews.ru/news/rss/', region: 'Россия' },
  { url: 'https://habr.com/ru/rss/hub/artificial_intelligence/all/', region: 'Россия' },
  { url: 'https://habr.com/ru/rss/hub/machine_learning/all/', region: 'Россия' },
  { url: 'https://habr.com/ru/rss/hub/data_centers/all/', region: 'Россия' },
  { url: 'https://habr.com/ru/rss/hub/high_performance_computing/all/', region: 'Россия' },
  { url: 'https://ai-news.ru/feed/', region: 'Россия' },
  { url: 'https://neurohive.io/feed/', region: 'Россия' },
  { url: 'https://www.jiqizhixin.com/rss', region: 'Китай' },
  { url: 'https://www.leiphone.com/rss', region: 'Китай' },
  { url: 'https://www.36kr.com/feed', region: 'Китай' },
  { url: 'https://www.qbitai.com/feed', region: 'Китай' },
  { url: 'https://www.ai-era.com/rss', region: 'Китай' },
  { url: 'https://www.pingwest.com/feed', region: 'Китай' },
  { url: 'https://www.ithome.com/rss', region: 'Китай' },
  { url: 'https://www.infoq.cn/feed', region: 'Китай' },
  { url: 'https://www.ai-bot.cn/rss', region: 'Китай' },
  { url: 'https://juejin.cn/rss', region: 'Китай' }
];

// Perplexity API функция
const fetchPerplexityNews = async (apiKey, existingUrls) => {
  const prompt = `Ты - эксперт-аналитик в области AI-инфраструктуры, в первую очередь, hardware. Твоя задача - из предоставленных новостей выбрать те, которые наиболее релевантны указанным ниже темам и перевести их на русский. Тебе нужно обработать весь список новостей и для каждой выбрать одну или несколько категорий из предложенных.

Темы:
1. **Новые GPU и ASIC для тренинга и инференса моделей**: Всё, что связано с новыми графическими процессорами (GPU) и специализированными процессорами (ASIC), которые предназначены для ускорения обучения и инференса моделей машинного обучения (AI).
2. **Архитектура ЦОД, дата-центров, POD и суперкомпьютеров**: Все новости, касающиеся архитектуры дата-центров, построения и масштабирования мощных инфраструктур (например, POD-структуры и суперкомпьютеры).
3. **Интерконнект ускорителей, серверов и стоек**: Новости о сетевых технологиях и решениях для подключения и взаимодействия различных компонентов инфраструктуры, включая ускорители, серверы и стойки.
4. **Строительство новых дата-центров для AI**: Все, что связано с проектированием и строительством новых дата-центров, особенно для применения в AI-инфраструктуре.
5. **Китайское и российское импортозамещение для AI инфраструктуры**: Новости о новых разработках в области AI-инфраструктуры, которые происходят в Китае и России, включая создание новых чипов, устройств и решений, заменяющих западные технологии.

Что неинтересно:
1. Новости о наградах и бизнесе
2. PC и софт для PC
3. B2C продукты
4. Опыт обычных пользователей (мы строим большую инфру)

Прочитай заголовок и описание каждой новости, оцени, соответствует ли новость одной из указанных тем. Если да - добавь её в список для публикации. 
Важно - переведи все заголовки на русский язык.
Важно - обязательно добавляй китайские источники и новости о китайских компаниях и производителях`;

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: 'Возвращай ТОЛЬКО JSON без markdown' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'month',
        return_images: false,
        return_related_questions: false,
        max_tokens: 4000
      })
    });

    if (!res.ok) throw new Error(`API ошибка: ${res.status}`);
    
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    const json = raw.replace(/```json[\s\n]*/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(json.match(/\[[\s\S]*\]/)?.[0] || json);
    
    return parsed.map((item, i) => ({
      title: item?.title?.trim(),
      description: item?.description?.trim(),
      importance: item?.importance?.trim() || 'Требует анализа',
      tags: item.tags || ['Дата-центры'],
      region: item.region || 'Глобальный',
      source: item.source?.trim(),
      priority: 'эффективность'
    })).filter(n => n.title && n.source && !existingUrls.has(n.source));
  } catch (error) {
    console.error('Perplexity error:', error);
    throw error;
  }
};

export default function AINewsDashboard() {
  const [news, setNews] = useState([]);
  const [settings, setSettings] = useState({
    useRSS: true,
    usePerplexity: false,
    perplexityApiKey: '',
    telegramBotToken: '',
    telegramChatId: '',
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNewsForm, setNewNewsForm] = useState({
    title: '', description: '', importance: '', tags: [], 
    region: 'Глобальный', source: '', priority: 'эффективность'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [newsData, settingsData] = await Promise.all([
        newsAPI.getAll(),
        settingsAPI.get().catch(() => ({})),
      ]);
      setNews(newsData);
      setSettings(prev => ({ ...prev, ...settingsData }));
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setSearchError('Не удалось загрузить данные с сервера');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNews = useMemo(() => {
    let f = [...news];
    if (selectedTags.length > 0) f = f.filter(i => i.tags?.some(t => selectedTags.includes(t)));
    if (selectedRegions.length > 0) f = f.filter(i => selectedRegions.includes(i.region));
    if (selectedPriorities.length > 0) f = f.filter(i => selectedPriorities.includes(i.priority));
    if (showStarredOnly) f = f.filter(i => i.starred);
    return f.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  }, [news, selectedTags, selectedRegions, selectedPriorities, showStarredOnly]);

  const handleAuth = async () => {
    if (passwordInput === 'admin123') {
      const token = 'temp_token_' + Date.now();
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      await loadData();
    } else {
      alert('Неверный пароль');
    }
  };

  const toggleStar = async (id) => {
    if (!isAuthenticated) { setShowPasswordModal(true); return; }
    try {
      const item = news.find(n => n.id === id);
      const updated = { ...item, starred: !item.starred };
      await newsAPI.update(id, { starred: updated.starred });
      setNews(prev => prev.map(n => n.id === id ? updated : n));
    } catch (error) {
      alert('❌ Ошибка сохранения');
    }
  };

  // ИСПРАВЛЕННАЯ ФУНКЦИЯ searchNews
  const searchNews = async () => {
    if (!settings.useRSS && !settings.usePerplexity) {
      alert('Включите хотя бы один источник');
      return;
    }

    if (settings.usePerplexity && !settings.perplexityApiKey) {
      alert('Добавьте Perplexity API ключ');
      setShowSettings(true);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const existingUrls = new Set(news.filter(n => n.source).map(n => n.source));
      let allResults = [];

      if (settings.useRSS) {
        const { results, errors } = await fetchRSSNews(existingUrls);
        allResults = [...allResults, ...results];
        if (errors.length > 0) console.warn('RSS ошибки:', errors);
      }

      if (settings.usePerplexity) {
        const results = await fetchPerplexityNews(settings.perplexityApiKey, existingUrls);
        allResults = [...allResults, ...results];
      }

      if (allResults.length === 0) {
        alert('Нет новых новостей');
        return;
      }

      const newItems = allResults.map((item, i) => ({
        ...item,
        id: Date.now() + i,
        date: new Date().toISOString().split('T')[0],
        starred: false
      }));

      await newsAPI.bulkCreate(newItems);
      await loadData();
      alert(`✅ Добавлено ${newItems.length} новостей`);
    } catch (error) {
      setSearchError(error.message);
      alert(`❌ Ошибка: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const saveSettings = async () => {
    try {
      await settingsAPI.update(settings);
      alert('✅ Настройки сохранены!');
      setShowSettings(false);
    } catch (error) {
      alert('❌ Ошибка сохранения настроек');
    }
  };

  const handleAddNews = async () => {
    if (!newNewsForm.title || !newNewsForm.description) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const newsItem = {
        ...newNewsForm,
        date: new Date().toISOString().split('T')[0],
        starred: false,
      };
      await newsAPI.create(newsItem);
      await loadData();
      setShowAddNews(false);
      setNewNewsForm({ title: '', description: '', importance: '', tags: [], region: 'Глобальный', source: '', priority: 'эффективность' });
      alert('✅ Новость добавлена!');
    } catch (error) {
      alert('❌ Ошибка добавления');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
      <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Модальное окно входа */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Вход</h3>
            <input type="password" placeholder="Пароль" className="w-full px-3 py-2 border rounded-lg mb-4"
              value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAuth()} autoFocus />
            <div className="flex gap-2">
              <button onClick={handleAuth} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Войти</button>
              <button onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }}
                className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления новости */}
      {showAddNews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">Добавить новость</h3>
              <button onClick={() => setShowAddNews(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Заголовок *</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" value={newNewsForm.title}
                  onChange={(e) => setNewNewsForm(prev => ({ ...prev, title: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Описание *</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows="3" value={newNewsForm.description}
                  onChange={(e) => setNewNewsForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Важность для R&D</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows="2" value={newNewsForm.importance}
                  onChange={(e) => setNewNewsForm(prev => ({ ...prev, importance: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm mb-1">Источник (URL)</label>
                <input type="url" className="w-full px-3 py-2 border rounded-lg" value={newNewsForm.source}
                  onChange={(e) => setNewNewsForm(prev => ({ ...prev, source: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Регион</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={newNewsForm.region}
                    onChange={(e) => setNewNewsForm(prev => ({ ...prev, region: e.target.value }))}>
                    {ALL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Приоритет</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={newNewsForm.priority}
                    onChange={(e) => setNewNewsForm(prev => ({ ...prev, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Теги</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => (
                    <button key={tag} type="button"
                      onClick={() => setNewNewsForm(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                      }))}
                      className={`px-3 py-1 rounded-full text-sm ${newNewsForm.tags.includes(tag) ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleAddNews} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Добавить</button>
              <button onClick={() => setShowAddNews(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно настроек */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold">Настройки</h3>
              <button onClick={() => setShowSettings(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Источники новостей</h4>
                <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={settings.useRSS} className="w-4 h-4"
                    onChange={(e) => setSettings(prev => ({ ...prev, useRSS: e.target.checked }))} />
                  <span className="text-sm">Использовать RSS фиды</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={settings.usePerplexity} className="w-4 h-4"
                    onChange={(e) => setSettings(prev => ({ ...prev, usePerplexity: e.target.checked }))} />
                  <span className="text-sm">Использовать Perplexity AI</span>
                </label>
              </div>
              <div>
                <label className="block text-sm mb-1">Perplexity API Key</label>
                <input type="password" placeholder="pplx-..." className="w-full px-3 py-2 border rounded-lg"
                  value={settings.perplexityApiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, perplexityApiKey: e.target.value }))} />
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Telegram (опционально)</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm mb-1">Bot Token</label>
                    <input type="password" className="w-full px-3 py-2 border rounded-lg"
                      value={settings.telegramBotToken}
                      onChange={(e) => setSettings(prev => ({ ...prev, telegramBotToken: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Chat ID</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg"
                      value={settings.telegramChatId}
                      onChange={(e) => setSettings(prev => ({ ...prev, telegramChatId: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveSettings} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Сохранить</button>
              <button onClick={() => setShowSettings(false)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 AI Infrastructure News Portal</h1>
          <p className="text-gray-600">Все устройства синхронизированы через MySQL</p>
        </div>

        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-md mb-6 p-4">
            <div className="flex flex-wrap justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm bg-green-100 text-green-600 px-3 py-1 rounded-full">✅ Админ</span>
                <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('authToken'); }}
                  className="text-sm text-gray-500 hover:text-gray-700">Выйти</button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={searchNews} disabled={isSearching}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  <Search className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                  {isSearching ? 'Загрузка...' : 'Найти новости'}
                </button>
                <button onClick={() => {
                  if (window.confirm('Удалить ВСЕ новости?')) {
                    alert('Функция очистки - в разработке');
                  }
                }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4" />
                  Очистить
                </button>
                <button onClick={() => setShowAddNews(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                  Добавить
                </button>
                <button onClick={() => {
                  if (!settings.telegramBotToken || !settings.telegramChatId) {
                    alert('Настройте Telegram'); setShowSettings(true); return;
                  }
                  alert('Telegram - в разработке');
                }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Send className="w-4 h-4" />
                  Telegram
                </button>
                <button onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  <Settings className="w-4 h-4" />
                  Настройки
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Фильтры */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
          <div className="flex justify-between mb-4">
            <button onClick={() => setShowFilters(s => !s)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Filter className="w-4 h-4" /> Фильтры
            </button>
            <button onClick={() => setShowStarredOnly(s => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showStarredOnly ? 'bg-yellow-100' : 'bg-gray-100'}`}>
              <Star className={`w-4 h-4 ${showStarredOnly ? 'fill-current' : ''}`} />
              Избранное ({news.filter(n => n.starred).length})
            </button>
          </div>

          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-semibold mb-2">Категории</h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(t => (
                    <button key={t} onClick={() => setSelectedTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
                      className={`px-3 py-1 rounded-full text-sm ${selectedTags.includes(t) ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Регионы</h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_REGIONS.map(r => (
                    <button key={r} onClick={() => setSelectedRegions(p => p.includes(r) ? p.filter(x => x !== r) : [...p, r])}
                      className={`px-3 py-1 rounded-full text-sm ${selectedRegions.includes(r) ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Приоритеты</h3>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.id} onClick={() => setSelectedPriorities(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                      className={`px-3 py-1 rounded-full text-sm ${selectedPriorities.includes(p.id) ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mb-4 text-sm text-gray-600">
          <span>Показано: <b>{filteredNews.length}</b> из {news.length}</span>
          {!isAuthenticated && <button onClick={() => setShowPasswordModal(true)} className="text-blue-600">Войти</button>}
        </div>

        {/* Список новостей */}
        {filteredNews.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            {isAuthenticated ? 'Новостей нет. Нажмите "Найти новости".' : 'Войдите для управления новостями'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNews.map(item => (
              <div key={item.id} className={`bg-white rounded-lg shadow-sm border p-6 ${item.starred ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}>
                <div className="flex gap-4">
                  <button onClick={() => toggleStar(item.id)}
                    className={`flex-shrink-0 ${item.starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}`}>
                    <Star className={`w-6 h-6 ${item.starred ? 'fill-current' : ''}`} />
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <a href={item.source} target="_blank" rel="noopener noreferrer"
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 flex items-center gap-2">
                        {item.title}
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </a>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {new Date(item.date || item.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{item.description}</p>
                    {item.importance && item.importance !== 'Требует анализа' && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                        <p className="text-sm text-blue-900">
                          <strong>Важность для R&D:</strong> {item.importance}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 items-center">
                      {item.tags?.map(t => (
                        <span key={t} className="px-3 py-1 bg-gray-100 text-xs rounded-full">{t}</span>
                      ))}
                      <span className="px-3 py-1 bg-green-100 text-xs rounded-full">📍 {item.region}</span>
                      <span className="px-3 py-1 bg-purple-100 text-xs rounded-full">
                        {PRIORITIES.find(p => p.id === item.priority)?.label || 'Эффективность'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
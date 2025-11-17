// server.js — ДОБАВЬТЕ ЭТИ ENDPOINTS

import fetch from 'node-fetch';
import parser from 'fast-xml-parser';

// CORS middleware (добавьте в самое начало)
app.use(cors({
  origin: ['https://ai-infra.ru', 'http://localhost:5173'],
  credentials: true
}));

// Новый endpoint для загрузки RSS
app.post('/api/news/fetch-rss', authenticateToken, async (req, res) => {
  try {
    const { feeds } = req.body;
    const existingUrls = new Set(req.body.existingUrls || []);
    const results = [];
    const errors = [];

    for (const feed of feeds || RSS_FEEDS) {
      try {
        // Прямой запрос с backend (нет CORS!)
        const response = await fetch(feed.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AI-Infra-Bot/1.0)'
          }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const xmlText = await response.text();
        const jsonObj = parser.parse(xmlText, {
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          textNodeName: "text"
        });

        // Парсинг items (универсальный)
        const items = jsonObj.rss?.channel?.item || jsonObj.feed?.entry || [];
        
        for (const item of items.slice(0, 5)) {
          const title = item.title?.text || item.title;
          const link = item.link?.text || item.link || item['@_href'];
          const desc = (item.description?.text || item.description || item.summary?.text || '').replace(/<[^>]*>/g, '').trim();
          
          if (!title || !link || existingUrls.has(link)) continue;
          
          results.push({
            title,
            description: desc.substring(0, 300) + (desc.length > 300 ? '...' : ''),
            importance: 'Требует анализа',
            tags: ['Дата-центры'],
            region: feed.region,
            source: link,
            priority: 'эффективность'
          });
          existingUrls.add(link);
        }
      } catch (error) {
        console.error(`RSS ошибка ${feed.url}:`, error.message);
        errors.push({ feed: feed.url, error: error.message });
      }
    }

    res.json({ results, errors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновленный Perplexity endpoint
app.post('/api/news/fetch-perplexity', authenticateToken, async (req, res) => {
  try {
    const { apiKey, existingUrls } = req.body;
    const results = await fetchPerplexityNews(apiKey, new Set(existingUrls));
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Установите зависимости:
// npm install node-fetch fast-xml-parser
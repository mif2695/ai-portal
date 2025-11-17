CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    importance TEXT,
    tags JSON,
    region VARCHAR(50) DEFAULT 'Глобальный',
    source VARCHAR(500),
    priority VARCHAR(50) DEFAULT 'эффективность',
    date DATE,
    starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date(date),
    INDEX idx_starred(starred),
    INDEX idx_region(region)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Для будущей реальной аутентификации
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Для хранения настроек
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    perplexity_api_key VARCHAR(255),
    telegram_bot_token VARCHAR(255),
    telegram_chat_id VARCHAR(100),
    use_rss BOOLEAN DEFAULT TRUE,
    use_perplexity BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
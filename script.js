// 預防肌肉健康留言板 - 主要功能控制器
class MessageBoard {
    constructor() {
        this.messages = this.loadMessages();
        this.currentTopic = this.loadTopic();
        this.currentFilter = 'all';
        this.chart = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayMessages();
        this.updateStats();
        this.updateTopicDisplay();
        this.initChart();
    }

    setupEventListeners() {
        // 留言表單提交
        document.getElementById('messageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMessage();
        });

        // 點擊模態背景關閉
        document.getElementById('topicModal').addEventListener('click', (e) => {
            if (e.target.id === 'topicModal') {
                this.closeTopicModal();
            }
        });
    }

    // 載入儲存的留言
    loadMessages() {
        const saved = localStorage.getItem('muscleHealthMessages');
        return saved ? JSON.parse(saved) : this.getDefaultMessages();
    }

    // 載入儲存的主題
    loadTopic() {
        return localStorage.getItem('currentTopic') || '預防肌肉拉傷的方法';
    }

    // 儲存留言到本地存儲
    saveMessages() {
        localStorage.setItem('muscleHealthMessages', JSON.stringify(this.messages));
    }

    // 儲存主題到本地存儲
    saveTopic() {
        localStorage.setItem('currentTopic', this.currentTopic);
    }

    // 預設留言（示例數據）
    getDefaultMessages() {
        return [
            {
                id: 1,
                username: '健身愛好者',
                content: '我發現運動前做充分的熱身運動真的很重要！特別是動態拉伸，可以有效預防肌肉拉傷。建議大家運動前至少花10-15分鐘做熱身。',
                category: 'prevention',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                anonymous: false
            },
            {
                id: 2,
                username: '',
                content: '請問有人知道什麼運動器材比較適合肌肉恢復嗎？我最近運動後肌肉痠痛比較嚴重。',
                category: 'question',
                timestamp: new Date(Date.now() - 43200000).toISOString(),
                anonymous: true
            },
            {
                id: 3,
                username: '營養師小王',
                content: '蛋白質補充對肌肉恢復很重要！建議運動後30分鐘內攝取優質蛋白質，如雞蛋、牛奶或蛋白粉。每公斤體重需要1.2-2.0克蛋白質。',
                category: 'nutrition',
                timestamp: new Date(Date.now() - 21600000).toISOString(),
                anonymous: false
            }
        ];
    }

    // 新增留言
    addMessage() {
        const username = document.getElementById('username').value.trim();
        const content = document.getElementById('message').value.trim();
        const category = document.getElementById('category').value;

        if (!content) {
            alert('請輸入留言內容！');
            return;
        }

        const newMessage = {
            id: Date.now(),
            username: username || '',
            content: content,
            category: category,
            timestamp: new Date().toISOString(),
            anonymous: !username
        };

        this.messages.unshift(newMessage);
        this.saveMessages();
        this.displayMessages();
        this.updateStats();
        this.updateChart();

        // 清空表單
        document.getElementById('messageForm').reset();
        
        // 顯示成功提示
        this.showNotification('留言發表成功！', 'success');
    }

    // 顯示留言
    displayMessages() {
        const container = document.getElementById('messagesList');
        const filteredMessages = this.currentFilter === 'all' 
            ? this.messages 
            : this.messages.filter(msg => msg.category === this.currentFilter);

        if (filteredMessages.length === 0) {
            container.innerHTML = '<div class="no-messages">暫無留言，快來發表第一則留言吧！</div>';
            return;
        }

        container.innerHTML = filteredMessages.map(message => `
            <div class="message-item">
                <div class="message-header">
                    <span class="message-author ${message.anonymous ? 'anonymous' : ''}">
                        ${message.anonymous ? '匿名用戶' : message.username}
                    </span>
                    <span class="message-category ${message.category}">
                        ${this.getCategoryName(message.category)}
                    </span>
                </div>
                <div class="message-content">${this.formatContent(message.content)}</div>
                <div class="message-time">${this.formatTime(message.timestamp)}</div>
            </div>
        `).join('');
    }

    // 格式化留言內容（支持換行）
    formatContent(content) {
        return content.replace(/\n/g, '<br>');
    }

    // 格式化時間顯示
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1分鐘內
            return '剛剛';
        } else if (diff < 3600000) { // 1小時內
            return `${Math.floor(diff / 60000)}分鐘前`;
        } else if (diff < 86400000) { // 24小時內
            return `${Math.floor(diff / 3600000)}小時前`;
        } else {
            return date.toLocaleDateString('zh-TW') + ' ' + date.toLocaleTimeString('zh-TW', {hour: '2-digit', minute: '2-digit'});
        }
    }

    // 獲取分類名稱
    getCategoryName(category) {
        const names = {
            'prevention': '預防方法',
            'exercise': '運動建議',
            'nutrition': '營養補充',
            'recovery': '恢復技巧',
            'equipment': '器材推薦',
            'question': '疑問求助'
        };
        return names[category] || category;
    }

    // 更新統計數據
    updateStats() {
        const today = new Date().toDateString();
        const todayMessages = this.messages.filter(msg => 
            new Date(msg.timestamp).toDateString() === today
        ).length;

        const categoryCount = {};
        this.messages.forEach(msg => {
            categoryCount[msg.category] = (categoryCount[msg.category] || 0) + 1;
        });

        const popularCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b, 'prevention'
        );

        const activeUsers = new Set(
            this.messages.filter(msg => !msg.anonymous).map(msg => msg.username)
        ).size;

        document.getElementById('totalMessages').textContent = this.messages.length;
        document.getElementById('todayMessages').textContent = todayMessages;
        document.getElementById('popularCategory').textContent = this.getCategoryName(popularCategory);
        document.getElementById('activeUsers').textContent = activeUsers;
    }

    // 初始化圖表
    initChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        const categoryCount = {
            'prevention': 0,
            'exercise': 0,
            'nutrition': 0,
            'recovery': 0,
            'equipment': 0,
            'question': 0
        };

        this.messages.forEach(msg => {
            categoryCount[msg.category]++;
        });

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryCount).map(key => this.getCategoryName(key)),
                datasets: [{
                    data: Object.values(categoryCount),
                    backgroundColor: [
                        '#27ae60', // prevention
                        '#e74c3c', // exercise
                        '#f39c12', // nutrition
                        '#9b59b6', // recovery
                        '#34495e', // equipment
                        '#e67e22'  // question
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 更新圖表
    updateChart() {
        if (!this.chart) return;

        const categoryCount = {
            'prevention': 0,
            'exercise': 0,
            'nutrition': 0,
            'recovery': 0,
            'equipment': 0,
            'question': 0
        };

        this.messages.forEach(msg => {
            categoryCount[msg.category]++;
        });

        this.chart.data.datasets[0].data = Object.values(categoryCount);
        this.chart.update();
    }

    // 更新主題顯示
    updateTopicDisplay() {
        document.getElementById('current-topic-text').textContent = this.currentTopic;
    }

    // 顯示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 標籤切換功能
function showTab(tabName) {
    // 隱藏所有標籤內容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有標籤按鈕的活躍狀態
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 顯示選中的標籤內容
    document.getElementById(tabName).classList.add('active');
    
    // 設置對應按鈕為活躍狀態
    event.target.classList.add('active');

    // 如果是文字雲標籤，生成文字雲
    if (tabName === 'wordcloud') {
        setTimeout(() => generateWordCloud(), 100);
    }
}

// 留言篩選功能
function filterMessages(category) {
    messageBoard.currentFilter = category;
    
    // 更新篩選按鈕狀態
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新顯示留言
    messageBoard.displayMessages();
}

// 主題設定功能
function showTopicModal() {
    document.getElementById('topicModal').classList.add('active');
}

function closeTopicModal() {
    document.getElementById('topicModal').classList.remove('active');
}

function setTopic(topic) {
    messageBoard.currentTopic = topic;
    messageBoard.saveTopic();
    messageBoard.updateTopicDisplay();
    closeTopicModal();
    messageBoard.showNotification(`主題已更改為：${topic}`, 'success');
}

function setCustomTopic() {
    const customTopic = document.getElementById('customTopic').value.trim();
    if (!customTopic) {
        alert('請輸入自訂主題！');
        return;
    }
    
    setTopic(customTopic);
    document.getElementById('customTopic').value = '';
}

// 模板使用功能
function useTemplate(templateType) {
    const templates = {
        'exercise': `運動項目：[填入運動名稱]
持續時間：[填入時間]
效果：[描述對肌肉的幫助]
注意事項：[提醒要注意的地方]
推薦指數：⭐⭐⭐⭐⭐`,

        'nutrition': `補充品名稱：[填入名稱]
服用方式：[描述服用方法]
效果：[對肌肉健康的幫助]
副作用：[如有請註明]
推薦對象：[適合的人群]`,

        'equipment': `器材名稱：[填入器材名稱]
使用方法：[簡述使用方式]
優點：[列出優點]
缺點：[如有請註明]
購買建議：[價格、品牌等建議]`,

        'question': `問題描述：[詳細描述遇到的問題]
已嘗試方法：[列出已經試過的方法]
個人情況：[年齡、運動習慣等]
希望得到：[具體需要什麼幫助]`
    };

    // 切換到留言板標籤
    showTab('messages');
    
    // 填入模板內容
    document.getElementById('message').value = templates[templateType];
    
    // 設置對應的分類
    const categoryMap = {
        'exercise': 'exercise',
        'nutrition': 'nutrition',
        'equipment': 'equipment',
        'question': 'question'
    };
    document.getElementById('category').value = categoryMap[templateType];
    
    // 滾動到表單位置
    document.querySelector('.message-form').scrollIntoView({ behavior: 'smooth' });
    
    messageBoard.showNotification('模板已套用，請修改相關內容後發表', 'success');
}

// 文字雲功能
function generateWordCloud() {
    const canvas = document.getElementById('wordcloud-canvas');
    const ctx = canvas.getContext('2d');
    
    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 收集所有留言內容
    const allText = messageBoard.messages.map(msg => msg.content).join(' ');
    
    // 簡單的中文分詞（基於常見詞彙）
    const keywords = extractKeywords(allText);
    
    if (keywords.length === 0) {
        ctx.fillStyle = '#7f8c8d';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('暫無足夠數據生成文字雲', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // 生成文字雲數據
    const wordCloudData = keywords.map(([word, count]) => [word, count * 10]);
    
    try {
        WordCloud(canvas, {
            list: wordCloudData,
            gridSize: Math.round(16 * canvas.width / 1024),
            weightFactor: function (size) {
                return Math.pow(size, 2.3) * canvas.width / 1024;
            },
            fontFamily: 'Microsoft JhengHei, Arial, sans-serif',
            color: function () {
                const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
                return colors[Math.floor(Math.random() * colors.length)];
            },
            rotateRatio: 0.5,
            rotationSteps: 2,
            backgroundColor: 'transparent'
        });
    } catch (error) {
        console.error('文字雲生成失敗:', error);
        ctx.fillStyle = '#e74c3c';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('文字雲生成失敗，請稍後再試', canvas.width / 2, canvas.height / 2);
    }
}

// 關鍵字提取函數
function extractKeywords(text) {
    // 移除標點符號和特殊字符
    const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ');
    
    // 肌肉健康相關關鍵詞
    const healthKeywords = [
        '肌肉', '運動', '健身', '拉傷', '預防', '恢復', '營養', '蛋白質',
        '熱身', '伸展', '按摩', '休息', '訓練', '器材', '補充', '維生素',
        '鈣質', '水分', '睡眠', '疲勞', '痠痛', '放鬆', '強化', '柔軟度',
        '有氧', '無氧', '重訓', '瑜伽', '游泳', '跑步', '騎車', '健走'
    ];
    
    const wordCount = {};
    
    // 統計關鍵詞出現次數
    healthKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'g');
        const matches = cleanText.match(regex);
        if (matches) {
            wordCount[keyword] = matches.length;
        }
    });
    
    // 也統計一些常見的2-3字詞
    const words = cleanText.match(/[\u4e00-\u9fa5]{2,3}/g) || [];
    words.forEach(word => {
        if (word.length >= 2 && !['我們', '可以', '這個', '那個', '如果', '因為', '所以', '但是', '而且', '或者'].includes(word)) {
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    });
    
    // 排序並返回前20個詞
    return Object.entries(wordCount)
        .filter(([word, count]) => count > 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);
}

// 下載文字雲圖片
function downloadWordCloud() {
    const canvas = document.getElementById('wordcloud-canvas');
    const link = document.createElement('a');
    link.download = '肌肉健康文字雲.png';
    link.href = canvas.toDataURL();
    link.click();
    
    messageBoard.showNotification('文字雲圖片已下載', 'success');
}

// 全局變量
let messageBoard;

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    messageBoard = new MessageBoard();
    
    // 添加動畫樣式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .no-messages {
            text-align: center;
            color: #7f8c8d;
            font-style: italic;
            padding: 40px;
            background: #f8f9fa;
            border-radius: 10px;
            margin: 20px 0;
        }
    `;
    document.head.appendChild(style);
});
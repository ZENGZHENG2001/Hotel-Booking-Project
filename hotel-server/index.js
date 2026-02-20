const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- 核心修复：解除 CSP 安全拦截与 URL 空格清洗 ---
app.use((req, res, next) => {
  // 1. 自动去掉 URL 里的空格，解决 image_e171a7.png 中的匹配问题
  req.url = decodeURIComponent(req.url).trim();

  // 2. 解除 image_e1d775.png 中的安全策略拦截，允许图片加载
  res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: blob:;");
  next();
});

// --- 强制路径对齐 ---
const assetsDir = path.resolve(__dirname, 'assets');

// 静态资源托管
app.use('/assets', express.static(assetsDir));

const DATA_PATH = path.join(__dirname, 'hotels.json');
const DEFAULT_STOCK = 10;

const readHotels = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    const hotels = JSON.parse(data);

    // --- 后端自动纠错 ---
    return hotels.map(hotel => ({
      ...hotel,
      image: hotel.image ? hotel.image.trim() : ''
    }));
  } catch (err) {
    console.error("读取数据失败:", err);
    return [];
  }
};

const writeHotels = (data) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
};

app.get('/api/hotels', (req, res) => {
  const { city, keyword, stars, checkIn, checkOut, type, minPrice, maxPrice, minScore, sort } = req.query;
  let hotels = readHotels();

  let result = hotels.filter(h => h.status === 'published');

  if (type && type !== 'all' && type !== 'hotel') {
    result = result.filter(h => h.type === type);
  }

  if (city && city !== '全部') {
    result = result.filter(h => h.address.includes(city));
  }

  if (stars && stars.trim() !== '') {
    const starList = stars.split(',').map(Number);
    result = result.filter(h => starList.includes(Number(h.stars)));
  }

  const low = Number(minPrice || 0);
  const high = Number(maxPrice || 99999);
  result = result.filter(h => h.price >= low && h.price <= high);

  if (minScore) {
    result = result.filter(h => h.score >= parseFloat(minScore));
  }

  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(h =>
      h.name.toLowerCase().includes(kw) ||
      h.location.toLowerCase().includes(kw) ||
      h.address.toLowerCase().includes(kw) ||
      (h.tags && h.tags.some(tag => tag.toLowerCase().includes(kw)))
    );
  }

  if (sort === 'price_low') result.sort((a, b) => a.price - b.price);
  else if (sort === 'price_high') result.sort((a, b) => b.price - a.price);
  else if (sort === 'score') result.sort((a, b) => b.score - a.score);
  else if (sort === 'star') result.sort((a, b) => b.stars - a.stars);

  if (checkIn && checkOut) {
    result = result.filter(hotel => {
      return hotel.rooms && hotel.rooms.some(room => {
        let isAllDaysAvailable = true;
        const start = dayjs(checkIn);
        const end = dayjs(checkOut);
        const nights = end.diff(start, 'day');

        for (let i = 0; i < nights; i++) {
          const currentDay = start.add(i, 'day').format('YYYY-MM-DD');
          let stock = (room.availability && room.availability[currentDay] !== undefined)
            ? room.availability[currentDay] : DEFAULT_STOCK;
          if (stock <= 0) {
            isAllDaysAvailable = false;
            break;
          }
        }
        return isAllDaysAvailable;
      });
    });
  }

  res.json(result);
});

app.get('/api/hotels/:id', (req, res) => {
  const hotels = readHotels();
  const hotel = hotels.find(h => h.id === parseInt(req.params.id));
  if (hotel) res.json(hotel);
  else res.status(404).json({ message: '酒店不存在' });
});

app.post('/api/admin/save-hotel', (req, res) => {
  let hotels = readHotels();
  const newHotel = req.body;
  if (newHotel.id) {
    const index = hotels.findIndex(h => h.id === newHotel.id);
    if (index !== -1) hotels[index] = { ...hotels[index], ...newHotel };
  } else {
    newHotel.id = Date.now();
    newHotel.status = 'pending';
    hotels.push(newHotel);
  }
  writeHotels(hotels);
  res.json({ success: true, data: newHotel });
});

app.listen(port, () => {
  console.log(`-----------------------------------------`);
  console.log(`服务端已启动: http://localhost:${port}`);
  console.log(`静态图片目录: ${assetsDir}`);

  try {
    const files = fs.readdirSync(assetsDir);
    console.log(`【自检】该目录下实际存在的文件数量:`, files.length);
    if (files.length === 0) console.warn("警告：assets 文件夹目前是空的！");
  } catch (err) {
    console.error("致命错误：无法访问 assets 目录，请检查文件夹是否存在！");
  }
  console.log(`-----------------------------------------`);
});
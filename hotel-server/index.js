const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// --- 核心修复：只加这一行，让浏览器能访问 assets 文件夹 ---
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const DATA_PATH = path.join(__dirname, 'hotels.json');
const DEFAULT_STOCK = 10;

const readHotels = () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8');
    const hotels = JSON.parse(data);

    // --- 后端自动纠错 ---
    // 自动修剪空格，防止路径解析失败
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
  console.log(`服务端已启动: http://localhost:${port}`);
  console.log(`静态目录: ${path.join(__dirname, 'assets')}`);
});
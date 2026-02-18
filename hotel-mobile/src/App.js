import { Swiper, Calendar, Popup, CascadePicker } from 'antd-mobile';
import './App.css';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import HotelListPage from './HotelListPage';
import HotelDetailPage from './HotelDetailPage';

dayjs.locale('zh-cn');

const importAll = (r) => r.keys().map(r);
const backgroundImages = importAll(require.context('./assets', false, /\.jpg$/));

const overseasCityData = [
  { label: '韩国', value: 'KR', children: [{ label: '首尔', value: 'SEL' }, { label: '济州岛', value: 'CJU' }] },
  { label: '日本', value: 'JP', children: [{ label: '东京', value: 'TYO' }, { label: '大阪', value: 'OSA' }] },
  { label: '泰国', value: 'TH', children: [{ label: '曼谷', value: 'BKK' }, { label: '普吉岛', value: 'HKT' }] }
];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [activeTab, setActiveTab] = useState('hotel');
  const [subType, setSubType] = useState('china');
  const [city, setCity] = useState('北京');
  const [isLocating, setIsLocating] = useState(false);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [chinaCityData, setChinaCityData] = useState([]);

  // --- 日历核心状态管理 (同步列表页逻辑) ---
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [dateRange, setDateRange] = useState([new Date(), dayjs().add(1, 'day').toDate()]);
  // 新增：内部预览状态，用于同步列表页的 selectingRange 逻辑
  const [selectingRange, setSelectingRange] = useState([new Date(), dayjs().add(1, 'day').toDate()]);

  // 酒店/民宿筛选状态
  const [occVisible, setOccVisible] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [priceVisible, setPriceVisible] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('不限');
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [isPriceConfirmed, setIsPriceConfirmed] = useState(false);
  const [minsuOccVisible, setMinsuOccVisible] = useState(false);
  const [guestCount, setGuestCount] = useState('不限');
  const [bedCount, setBedCount] = useState('不限');
  const [roomCount, setRoomCount] = useState('不限');
  const [isMinsuConfirmed, setIsMinsuConfirmed] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const bannerHotelMock = {
    id: 99,
    name: '上海陆家嘴禧玥酒店',
    stars: 5,
    image: require('./assets/9b2383793b12254f0908dd5e0a2d1889.jpeg'),
    score: 4.8,
    scoreText: '超棒',
    reviewCount: '4695',
    location: '近外滩 · 东方明珠',
    price: 936,
  };

  const levels = [
    { label: '二星及以下/经济', value: '2' },
    { label: '三星/舒适', value: '3' },
    { label: '四星/高档', value: '4' },
    { label: '五星/豪华', value: '5' }
  ];
  const priceOptions = ['不限', '¥150以下', '¥150-300', '¥300-450', '¥450-600', '¥600以上'];
  const hotelTags = ['双床房', '免费停车场', '含早餐', '4.7分以上', '亲子酒店', '行政套房'];
  const minsuTags = ['今夜特价', '春节特惠', '⭐积分当钱花', '解放碑/洪崖洞'];

  const nightCount = dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day');
  const formatDate = (date) => dayjs(date).format('M月D日');
  const getDayLabel = (date) => {
    const d = dayjs(date);
    const today = dayjs().startOf('day');
    if (d.isSame(today, 'day')) return '今天';
    if (d.isSame(today.add(1, 'day'), 'day')) return '明天';
    return d.format('ddd');
  };

  const updateOcc = (type, delta) => {
    if (type === 'rooms') setRooms(prev => Math.max(1, Math.min(9, prev + delta)));
    if (type === 'adults') setAdults(prev => Math.max(1, Math.min(20, prev + delta)));
    if (type === 'children') setChildren(prev => Math.max(0, Math.min(10, prev + delta)));
  };

  const fetchChinaCities = async () => {
    const KEY = 'f0f7c2a70cc7d73ecae91b411b571623';
    try {
      const url = `https://restapi.amap.com/v3/config/district?keywords=中国&subdistrict=2&key=${KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === '1') {
        const formatData = (districts) => districts.map(item => ({
          label: item.name, value: item.adcode,
          children: item.districts && item.districts.length > 0 ? formatData(item.districts) : undefined
        }));
        return formatData(data.districts[0].districts);
      }
    } catch (err) { console.error(err); }
    return [];
  };

  useEffect(() => { fetchChinaCities().then(res => setChinaCityData(res)); }, []);

  const handleLocate = (e) => {
    e.stopPropagation();
    setIsLocating(true);
    fetch(`https://restapi.amap.com/v3/ip?key=f0f7c2a70cc7d73ecae91b411b571623`)
      .then(res => res.json())
      .then(data => {
        if (data.status === '1' && typeof data.city === 'string') {
          const detectedCity = data.city.replace('市', '');
          setCity(detectedCity);
        }
      }).finally(() => setIsLocating(false));
  };

  // --- 核心：修改首页日期选择逻辑，使其与另外两页完全一致 ---
  const handleHomeDateChange = (val) => {
    setSelectingRange(val); // 同步预览状态
    if (activeTab === 'hourly') {
      if (val) {
        setDateRange([val, val]);
        setCalendarVisible(false);
      }
    } else {
      // 完全同步 HotelListPage 逻辑：选满起始和结束，且不是同一天才确认并关闭
      if (val && val[0] && val[1] && !dayjs(val[0]).isSame(dayjs(val[1]), 'day')) {
        setDateRange(val);
        setCalendarVisible(false);
      }
    }
  };

  // 同步 HotelListPage 的 handleCancelCalendar 逻辑
  const handleCancelHomeCalendar = () => {
    setSelectingRange(dateRange);
    setCalendarVisible(false);
  };

  const handleGoToDetail = (hotel, fromPage) => {
    setSelectedHotel({ ...hotel, fromPage });
    setCurrentPage('detail');
  };

  if (currentPage === 'detail') {
    return (
      <HotelDetailPage
        hotel={selectedHotel}
        onBack={() => setCurrentPage(selectedHotel.fromPage || 'home')}
      />
    );
  }

  if (currentPage === 'list') {
    return (
      <HotelListPage
        searchParams={{
          city: city,
          rawDateRange: dateRange,
          keyword: searchKeyword
        }}
        chinaCityData={chinaCityData}
        overseasCityData={overseasCityData}
        subType={subType}
        onBack={() => setCurrentPage('home')}
        onSelectHotel={(hotel) => handleGoToDetail(hotel, 'list')}
      />
    );
  }

  return (
    <div className="page-container">
      <div className="background-section">
        <Swiper autoplay loop indicatorProps={{ className: 'custom-indicator' }}>
          {backgroundImages.map((img, index) => (
            <Swiper.Item key={index} onClick={() => handleGoToDetail(bannerHotelMock, 'home')}>
              <div className="banner-img" style={{ backgroundImage: `url(${img.default || img})` }} />
            </Swiper.Item>
          ))}
        </Swiper>
        <div className="bottom-mask"></div>
      </div>

      <div className="main-content">
        <div className="search-card">
          <div className="card-tabs">
            <div className={`tab-item hotel-item ${activeTab === 'hotel' ? 'is-active' : ''}`} onClick={() => setActiveTab('hotel')}>
              <div className="inner-flex-box">
                <span className={`sub-label ${subType === 'china' ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); setSubType('china'); setCity('北京'); setActiveTab('hotel'); }}>国内</span>
                <i className="center-dot">·</i>
                <span className={`sub-label ${subType === 'overseas' ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); setSubType('overseas'); setCity('首尔'); setActiveTab('hotel'); }}>海外</span>
              </div>
            </div>
            <div className={`tab-item ${activeTab === 'minsu' ? 'is-active' : ''}`} onClick={() => setActiveTab('minsu')}>民宿</div>
            <div className={`tab-item ${activeTab === 'hourly' ? 'is-active' : ''}`} onClick={() => setActiveTab('hourly')}>钟点房</div>
          </div>

          <div className="card-row location-row">
            <div className="city-box" onClick={() => setCityPickerVisible(true)}>
              <span className="city-main">{city}</span>
              <i className="arrow-down-mini"></i>
              <div className={`city-loc-icon ${isLocating ? 'locating-rotate' : ''}`} onClick={handleLocate}></div>
            </div>
            <div className="vertical-divider"></div>
            <div className="search-input-area">
              <input className="search-input-main" placeholder={activeTab === 'minsu' ? "关键词/位置" : "位置/品牌/酒店"} value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
            </div>
          </div>

          <div className="card-row date-row-v2" onClick={() => setCalendarVisible(true)}>
            <div className="date-group">
              <div className="date-item">
                <span className="date-text">{formatDate(dateRange[0])}</span>
                <span className="date-festival">{getDayLabel(dateRange[0])}</span>
              </div>
              {activeTab !== 'hourly' && (
                <>
                  <span className="date-line">-</span>
                  <div className="date-item">
                    <span className="date-text">{formatDate(dateRange[1])}</span>
                    <span className="date-festival">{getDayLabel(dateRange[1])}</span>
                  </div>
                </>
              )}
            </div>
            {activeTab !== 'hourly' && <div className="date-stay">共{nightCount}晚</div>}
          </div>

          {activeTab !== 'hourly' && (
            activeTab === 'minsu' ? (
              <div className="card-row minsu-occ-row" onClick={() => setMinsuOccVisible(true)}>
                <span className={`price-placeholder-text ${isMinsuConfirmed ? 'active-val' : ''}`}>
                  {isMinsuConfirmed ? `${guestCount} / ${bedCount} / ${roomCount}` : '人/床/居数不限'}
                </span>
              </div>
            ) : (
              <div className="card-row occupancy-price-v3">
                <div className="occupancy-click-area" onClick={() => setOccVisible(true)}>
                  <span className="occupancy-main-text">{`${rooms}间房 ${adults}成人 ${children}儿童`}</span>
                  <i className="occupancy-arrow"></i>
                </div>
                <div className="hairline-divider"></div>
                <div className="price-click-area" onClick={() => setPriceVisible(true)}>
                  <span className={`price-placeholder-text ${isPriceConfirmed ? 'active-val' : ''}`}>
                    {isPriceConfirmed ? (
                      <>{selectedPrice !== '不限' ? selectedPrice : ''}{selectedPrice !== '不限' && selectedLevels.length > 0 ? ' / ' : ''}{selectedLevels.length === 0 ? (selectedPrice === '不限' ? '不限' : '') : selectedLevels.length === 1 ? levels.find(l => l.value === selectedLevels[0])?.label.split('/')[0] : `${selectedLevels.length}档星级`}</>
                    ) : '价格/星级'}
                  </span>
                </div>
              </div>
            )
          )}

          {activeTab !== 'hourly' && (
            <div className="tag-scroll-container">
              <div className="tag-wrapper">
                {(activeTab === 'minsu' ? minsuTags : hotelTags).map(tag => (
                  <span key={tag} className={`custom-tag ${searchKeyword === tag ? 'tag-active' : ''}`} onClick={() => setSearchKeyword(tag)}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div className="search-btn-container">
            <button className="main-search-btn" onClick={() => setCurrentPage('list')}>查询</button>
          </div>
        </div>
      </div>

      <CascadePicker
        options={subType === 'overseas' ? overseasCityData : chinaCityData}
        visible={cityPickerVisible}
        onClose={() => setCityPickerVisible(false)}
        onConfirm={(val, extend) => { setCity((extend.items[extend.items.length - 1]?.label || '北京').replace('市', '')); setCityPickerVisible(false); }}
      />

      {/* 修改后的统一日历弹窗逻辑，引入 handleCancelHomeCalendar */}
      <Popup visible={calendarVisible} onMaskClick={handleCancelHomeCalendar} bodyStyle={{ height: '70vh' }}>
        <Calendar
          selectionMode={activeTab === 'hourly' ? 'single' : 'range'}
          value={activeTab === 'hourly' ? selectingRange[0] : selectingRange}
          min={new Date()}
          onChange={handleHomeDateChange}
        />
      </Popup>

      <Popup visible={occVisible} onMaskClick={() => setOccVisible(false)} bodyStyle={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '0 20px 30px' }}>
        <div className="occ-header"><span className="close-x" onClick={() => setOccVisible(false)}>×</span><span className="occ-title">选择人数</span></div>
        {[{ l: '间数', t: 'rooms', v: rooms }, { l: '成人数', t: 'adults', v: adults }, { l: '儿童数', t: 'children', v: children }].map(item => (
          <div className="stepper-row" key={item.t}><span className="label">{item.l}</span><div className="stepper-box"><button onClick={() => updateOcc(item.t, -1)}>-</button><span className="val">{item.v}</span><button onClick={() => updateOcc(item.t, 1)}>+</button></div></div>
        ))}
        <button className="occ-done-btn" onClick={() => setOccVisible(false)}>完成</button>
      </Popup>

      <Popup visible={priceVisible} onMaskClick={() => setPriceVisible(false)} bodyStyle={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '0 20px 30px' }}>
        <div className="occ-header"><span className="close-x" onClick={() => setPriceVisible(false)}>×</span><span className="occ-title">价格/钻级</span></div>
        <div className="section-title">价格预算</div>
        <div className="tag-grid">{priceOptions.map(p => <span key={p} className={`filter-tag ${selectedPrice === p ? 'active' : ''}`} onClick={() => setSelectedPrice(p)}>{p}</span>)}</div>
        <div className="section-title" style={{ marginTop: '20px' }}>星级（可多选）</div>
        <div className="tag-grid">{levels.map(l => <span key={l.value} className={`filter-tag ${selectedLevels.includes(l.value) ? 'active' : ''}`} onClick={() => { const next = selectedLevels.includes(l.value) ? selectedLevels.filter(v => v !== l.value) : [...selectedLevels, l.value]; setSelectedLevels(next); }}>{l.label}</span>)}</div>
        <div className="occ-footer-btns">
          <button className="reset-btn" onClick={() => { setSelectedPrice('不限'); setSelectedLevels([]); setIsPriceConfirmed(false); }}>重置</button>
          <button className="occ-done-btn" style={{ flex: 1, marginTop: 0 }} onClick={() => { setIsPriceConfirmed(true); setPriceVisible(false); }}>完成</button>
        </div>
      </Popup>

      <Popup visible={minsuOccVisible} onMaskClick={() => setMinsuOccVisible(false)} bodyStyle={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '0 0 30px' }}>
        <div className="occ-header"><span className="close-x" onClick={() => setMinsuOccVisible(false)}>×</span><span className="occ-title">选择人/床/居数</span></div>
        <div className="minsu-selection-section">
          {[{ t: '人数', u: '人', s: guestCount, f: setGuestCount }, { t: '床铺', u: '床', s: bedCount, f: setBedCount }, { t: '居室', u: '居', s: roomCount, f: setRoomCount }].map(sec => (
            <React.Fragment key={sec.t}>
              <div className="pop-section-title"><span>{sec.t}</span></div>
              <div className="tag-grid-5">{['1', '2', '3', '4', '5'].map(n => <span key={n} className={`filter-tag ${sec.s === n + sec.u ? 'active' : ''}`} onClick={() => sec.f(n + sec.u)}>{n + sec.u}</span>)}</div>
            </React.Fragment>
          ))}
        </div>
        <div className="occ-footer-btns" style={{ padding: '0 20px' }}><button className="reset-btn" onClick={() => { setGuestCount('不限'); setBedCount('不限'); setRoomCount('不限'); setIsMinsuConfirmed(false); }}>清空</button><button className="occ-done-btn" style={{ flex: 1, marginTop: 0 }} onClick={() => { setIsMinsuConfirmed(true); setMinsuOccVisible(false); }}>完成</button></div>
      </Popup>
    </div>
  );
}

export default App;
import { Swiper, Calendar, Popup, CascadePicker } from 'antd-mobile';
import './App.css';
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 设置 dayjs 使用中文语言包，确保日期显示为“周一”等格式
dayjs.locale('zh-cn');

// 自动化加载 assets 文件夹下所有的 .jpg 图片，用于轮播图
const importAll = (r) => r.keys().map(r);
const backgroundImages = importAll(require.context('./assets', false, /\.jpg$/));

// 模拟的海外城市数据，结构为：国家 -> 城市
const overseasCityData = [
  { label: '韩国', value: 'KR', children: [{ label: '首尔', value: 'SEL' }, { label: '济州岛', value: 'CJU' }] },
  { label: '日本', value: 'JP', children: [{ label: '东京', value: 'TYO' }, { label: '大阪', value: 'OSA' }] },
  { label: '泰国', value: 'TH', children: [{ label: '曼谷', value: 'BKK' }, { label: '普吉岛', value: 'HKT' }] }
];

function App() {
  // --- 1. 基础 Tab 状态 (控制顶部大的三个 Tab 切换) ---
  const [activeTab, setActiveTab] = useState('hotel'); // hotel(国内·海外), minsu(民宿), hourly(钟点房)
  const [subType, setSubType] = useState('china');    // china(国内), overseas(海外)

  // --- 2. 城市与定位状态 ---
  const [city, setCity] = useState('北京');              // 当前显示的城市名
  const [isLocating, setIsLocating] = useState(false);  // 定位按钮是否正在旋转
  const [cityPickerVisible, setCityPickerVisible] = useState(false); // 城市选择器显隐
  const [chinaCityData, setChinaCityData] = useState([]); // 存储从高德 API 获取的国内城市数据

  // --- 3. 日历状态 ---
  const [calendarVisible, setCalendarVisible] = useState(false); // 日历弹窗显隐
  // dateRange 存储入住和离店日期，默认为 [今天, 明天]
  const [dateRange, setDateRange] = useState([new Date(), dayjs().add(1, 'day').toDate()]);

  // --- 4. 酒店人数/价格选择状态 (仅在酒店 Tab 使用) ---
  const [occVisible, setOccVisible] = useState(false);  // 人数选择弹窗显隐
  const [rooms, setRooms] = useState(1);                // 间数
  const [adults, setAdults] = useState(1);              // 成人人数
  const [children, setChildren] = useState(0);          // 儿童人数

  const [priceVisible, setPriceVisible] = useState(false); // 价格/钻级弹窗显隐
  const [selectedPrice, setSelectedPrice] = useState('不限'); // 选中的价格区间
  const [selectedLevels, setSelectedLevels] = useState([]);  // 选中的星级数组 (可多选)
  const [isPriceConfirmed, setIsPriceConfirmed] = useState(false); // 是否点击过“完成”，控制回显变黑

  // --- 5. 民宿特有状态 (仅在民宿 Tab 使用) ---
  const [minsuOccVisible, setMinsuOccVisible] = useState(false); // 民宿“人/床/居”弹窗显隐
  const [guestCount, setGuestCount] = useState('不限');           // 入住人数
  const [bedCount, setBedCount] = useState('不限');             // 床铺数
  const [roomCount, setRoomCount] = useState('不限');             // 居室数
  const [isMinsuConfirmed, setIsMinsuConfirmed] = useState(false); // 民宿条件是否已确认

  // 预设的星级选项
  const levels = [
    { label: '二星及以下/经济', value: '2' },
    { label: '三星/舒适', value: '3' },
    { label: '四星/高档', value: '4' },
    { label: '五星/豪华', value: '5' }
  ];
  // 预设的价格选项
  const priceOptions = ['不限', '¥150以下', '¥150-300', '¥300-450', '¥450-600', '¥600以上'];

  // --- 逻辑计算区 ---
  // 计算两日期之间的间夜数
  const nightCount = dayjs(dateRange[1]).diff(dayjs(dateRange[0]), 'day');
  // 日期格式化工具
  const formatDate = (date) => dayjs(date).format('M月D日');
  // 获取日期后的标签（今天、明天、或周几）
  const getDayLabel = (date) => {
    const d = dayjs(date);
    const today = dayjs().startOf('day');
    if (d.isSame(today, 'day')) return '今天';
    if (d.isSame(today.add(1, 'day'), 'day')) return '明天';
    return d.format('ddd');
  };

  // 修改人数步进器的通用函数
  const updateOcc = (type, delta) => {
    if (type === 'rooms') setRooms(prev => Math.max(1, Math.min(9, prev + delta)));
    if (type === 'adults') setAdults(prev => Math.max(1, Math.min(20, prev + delta)));
    if (type === 'children') setChildren(prev => Math.max(0, Math.min(10, prev + delta)));
  };

  // --- API 数据请求 ---
  // 获取高德 API 的国内行政区划数据
  const fetchChinaCities = async () => {
    const KEY = 'f0f7c2a70cc7d73ecae91b411b571623';
    try {
      const url = `https://restapi.amap.com/v3/config/district?keywords=中国&subdistrict=2&key=${KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === '1') {
        // 递归格式化 API 返回的树形结构以适配 CascadePicker 组件
        const formatData = (districts) => districts.map(item => ({
          label: item.name, value: item.adcode,
          children: item.districts && item.districts.length > 0 ? formatData(item.districts) : undefined
        }));
        return formatData(data.districts[0].districts);
      }
    } catch (err) { console.error(err); }
    return [];
  };

  // 页面加载时请求城市数据
  useEffect(() => { fetchChinaCities().then(res => setChinaCityData(res)); }, []);

  // 点击定位按钮的处理逻辑
  const handleLocate = (e) => {
    e.stopPropagation(); // 阻止点击事件向上冒泡到城市选择框
    setIsLocating(true); // 开始旋转图标
    fetch(`https://restapi.amap.com/v3/ip?key=f0f7c2a70cc7d73ecae91b411b571623`)
      .then(res => res.json())
      .then(data => {
        if (data.status === '1' && typeof data.city === 'string') {
          const detectedCity = data.city.replace('市', '');
          // 如果用户在“海外”Tab定位，检测到国内城市则自动切回国内模式
          if (subType === 'overseas') setSubType('china');
          setCity(detectedCity);
        }
      }).finally(() => setIsLocating(false));
  };

  // 搜索关键字和底部快捷标签
  const [searchKeyword, setSearchKeyword] = useState('');
  const hotelTags = ['双床房', '免费停车场', '含早餐', '4.7分以上', '亲子酒店', '行政套房'];
  const minsuTags = ['今夜特价', '春节特惠', '⭐积分当钱花', '解放碑/洪崖洞'];

  // 点击“查询”按钮
  const handleSearch = () => { alert(`查询中: ${city} ${searchKeyword}`); };

  return (
    <div className="page-container">
      {/* 顶部背景轮播图 */}
      <div className="background-section">
        <Swiper autoplay loop indicatorProps={{ className: 'custom-indicator' }}>
          {backgroundImages.map((img, index) => (
            <Swiper.Item key={index}>
              <div className="banner-img" style={{ backgroundImage: `url(${img.default || img})` }} />
            </Swiper.Item>
          ))}
        </Swiper>
        <div className="bottom-mask"></div> {/* 轮播图下方的渐变遮罩，使背景过渡自然 */}
      </div>

      <div className="main-content">
        <div className="search-card">
          {/* Tab 导航切换区域 */}
          <div className="card-tabs">
            {/* 国内·海外 Tab */}
            <div className={`tab-item hotel-item ${activeTab === 'hotel' ? 'is-active' : ''}`} onClick={() => { setActiveTab('hotel'); }}>
              <div className="inner-flex-box">
                <span className={`sub-label ${subType === 'china' ? 'on' : ''}`} onClick={(e) => {
                  e.stopPropagation();
                  setSubType('china');
                  if (subType === 'overseas') setCity('北京'); // 从海外切回国内时默认北京
                  setActiveTab('hotel');
                }}>国内</span>
                <i className="center-dot">·</i>
                <span className={`sub-label ${subType === 'overseas' ? 'on' : ''}`} onClick={(e) => {
                  e.stopPropagation();
                  setSubType('overseas');
                  setCity('首尔'); // 切换海外默认首尔
                  setActiveTab('hotel');
                }}>海外</span>
              </div>
            </div>
            {/* 民宿 Tab */}
            <div className={`tab-item ${activeTab === 'minsu' ? 'is-active' : ''}`} onClick={() => { setActiveTab('minsu'); }}>民宿</div>
            {/* 钟点房 Tab */}
            <div className={`tab-item ${activeTab === 'hourly' ? 'is-active' : ''}`} onClick={() => { setActiveTab('hourly'); }}>钟点房</div>
          </div>

          {/* 第一行：地点与搜索关键字 */}
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

          {/* 第二行：时间选择 */}
          <div className="card-row date-row-v2" onClick={() => setCalendarVisible(true)}>
            <div className="date-group">
              <div className="date-item">
                <span className="date-text">{formatDate(dateRange[0])}</span>
                <span className="date-festival">{getDayLabel(dateRange[0])}</span>
              </div>
              {/* 钟点房模式不需要离店日期 */}
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

          {/* 第三行：条件选择 (钟点房模式直接隐藏这一行) */}
          {activeTab !== 'hourly' && (
            activeTab === 'minsu' ? (
              // 民宿频道：显示“人/床/居”
              <div className="card-row minsu-occ-row" onClick={() => setMinsuOccVisible(true)}>
                <span className={`price-placeholder-text ${isMinsuConfirmed ? 'active-val' : ''}`}>
                  {isMinsuConfirmed ? `${guestCount} / ${bedCount} / ${roomCount}` : '人/床/居数不限'}
                </span>
              </div>
            ) : (
              // 酒店频道：显示“人数”和“价格/星级”
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

          {/* 第四行：滑动快捷标签区域 (钟点房模式隐藏) */}
          {activeTab !== 'hourly' && (
            <div className="tag-scroll-container">
              <div className="tag-wrapper">
                {(activeTab === 'minsu' ? minsuTags : hotelTags).map(tag => (
                  <span key={tag} className={`custom-tag ${searchKeyword === tag ? 'tag-active' : ''}`} onClick={() => setSearchKeyword(tag)}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* 第五行：查询按钮 */}
          <div className="search-btn-container">
            <button className={`main-search-btn ${activeTab === 'minsu' ? 'minsu-btn' : ''}`} onClick={handleSearch}>查询</button>
          </div>
        </div>
      </div>

      {/* --- 弹窗组件区 --- */}

      {/* 日历弹窗：酒店/民宿为 range(区间) 模式，钟点房为 single(单日) 模式 */}
      <Popup visible={calendarVisible} onMaskClick={() => setCalendarVisible(false)} bodyStyle={{ height: '70vh' }}>
        <Calendar
          selectionMode={activeTab === 'hourly' ? 'single' : 'range'}
          value={activeTab === 'hourly' ? dateRange[0] : dateRange}
          onChange={val => {
            if (activeTab === 'hourly') { setDateRange([val, val]); setCalendarVisible(false); }
            else if (val?.[0] && val?.[1]) { setDateRange(val); setCalendarVisible(false); }
          }}
        />
      </Popup>

      {/* 城市选择器：根据 Tab 自动决定是显示国内 API 数据还是模拟海外数据 */}
      <CascadePicker title='选择城市' options={activeTab === 'hotel' && subType === 'overseas' ? overseasCityData : chinaCityData} visible={cityPickerVisible} onClose={() => setCityPickerVisible(false)} onConfirm={(val, extend) => { setCity((extend.items[extend.items.length - 1]?.label || '北京').replace('市', '')); setCityPickerVisible(false); }} />

      {/* 酒店人数弹窗 (Stepper 步进器模式) */}
      <Popup visible={occVisible} onMaskClick={() => setOccVisible(false)} bodyStyle={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '0 20px 30px' }}>
        <div className="occ-header"><span className="close-x" onClick={() => setOccVisible(false)}>×</span><span className="occ-title">选择人数</span></div>
        {[{ l: '间数', t: 'rooms', v: rooms }, { l: '成人数', t: 'adults', v: adults }, { l: '儿童数', t: 'children', v: children }].map(item => (
          <div className="stepper-row" key={item.t}><span className="label">{item.l}</span><div className="stepper-box"><button onClick={() => updateOcc(item.t, -1)}>-</button><span className="val">{item.v}</span><button onClick={() => updateOcc(item.t, 1)}>+</button></div></div>
        ))}
        <button className="occ-done-btn" onClick={() => setOccVisible(false)}>完成</button>
      </Popup>

      {/* 民宿条件弹窗 (Grid 网格多选模式) */}
      <Popup visible={minsuOccVisible} onMaskClick={() => setMinsuOccVisible(false)} bodyStyle={{ borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '0 0 30px' }}>
        <div className="occ-header"><span className="close-x" onClick={() => setMinsuOccVisible(false)}>×</span><span className="occ-title">选择人/床/居数</span></div>
        <div className="minsu-pop-tips">不确定居室时，试试多选居室</div>
        <div className="minsu-selection-section">
          {[{ t: '人数', u: '人', s: guestCount, f: setGuestCount }, { t: '床铺', u: '床', s: bedCount, f: setBedCount }, { t: '居室', u: '居', s: roomCount, f: setRoomCount }].map(sec => (
            <React.Fragment key={sec.t}>
              <div className="pop-section-title"><span>{sec.t}</span><span className="sub">可多选</span><span className="more-link">更多{sec.u} &gt;</span></div>
              <div className="tag-grid-5">{['1', '2', '3', '4', '5'].map(n => <span key={n} className={`filter-tag ${sec.s === n + sec.u ? 'active' : ''}`} onClick={() => sec.f(n + sec.u)}>{n + sec.u}</span>)}</div>
            </React.Fragment>
          ))}
        </div>
        <div className="occ-footer-btns" style={{ padding: '0 20px' }}><button className="reset-btn" onClick={() => { setGuestCount('不限'); setBedCount('不限'); setRoomCount('不限'); setIsMinsuConfirmed(false); }}>清空</button><button className="occ-done-btn" style={{ flex: 1, marginTop: 0 }} onClick={() => { setIsMinsuConfirmed(true); setMinsuOccVisible(false); }}>完成</button></div>
      </Popup>

      {/* 酒店价格/钻级弹窗 (Grid 网格选择模式) */}
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
    </div>
  );
}

export default App;
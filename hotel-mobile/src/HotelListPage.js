import React, { useState } from 'react';
import { Calendar, CascadePicker, Popup, Slider, SideBar } from 'antd-mobile';
import dayjs from 'dayjs';
import './HotelListPage.css';

const HotelListPage = ({ searchParams, onBack, chinaCityData, overseasCityData, subType, onSelectHotel }) => {
  const [city, setCity] = useState(searchParams.city);
  const [confirmedDateRange, setConfirmedDateRange] = useState(searchParams.rawDateRange);
  const [selectingRange, setSelectingRange] = useState(searchParams.rawDateRange);
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [activeFilter, setActiveFilter] = useState(null);
  const [sortConfig, setSortConfig] = useState({ label: '欢迎度排序', value: 'welcome' });
  const [priceRange, setPriceRange] = useState([0, 1400]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDistMap, setSelectedDistMap] = useState({});
  const [activeSideKey, setActiveSideKey] = useState('dist');
  const [activeSubKey, setActiveSubKey] = useState('');
  const [filterActiveSideKey, setFilterActiveSideKey] = useState('hot');
  const [selectedMoreFilters, setSelectedMoreFilters] = useState({});

  const mockHotels = [
    {
      id: 1,
      name: '上海陆家嘴禧玥酒店',
      stars: 5,
      image: require('./assets/9b2383793b12254f0908dd5e0a2d1889.jpeg'),
      score: 4.8,
      scoreText: '超棒',
      reviewCount: '4695',
      collectCount: '6.3万',
      location: '近外滩 · 东方明珠',
      description: 'BOSS:25楼是沪上知名米其林新荣记',
      price: 936,
      tags: ['免费升级', '新中式风', '免费停车', '一线江景'],
      rank: '上海美景酒店榜 No.16',
      priceLabel: '钻石贵宾价'
    },
    {
      id: 2,
      name: '艺龙安悦酒店(上海浦东大道歇浦路地铁站店)',
      stars: 3,
      image: require('./assets/9b2383793b12254f0908dd5e0a2d1889.jpeg'),
      score: 4.7,
      scoreText: '超棒',
      reviewCount: '6729',
      collectCount: '4.5万',
      location: '近歇浦路地铁站 · LCM置汇旭辉广场',
      description: '临滨江步道可欣赏陆家嘴夜景',
      oldPrice: 297,
      price: 199,
      tags: ['免费停车', '免费洗衣服务', '机器人服务', '自助早餐'],
      brand: '艺龙酒店科技集团旗下品牌',
      footerTags: ['钻石贵宾价', '满减券', '3项优惠98 >']
    },
    {
      id: 3,
      name: '艺龙安悦酒店(上海浦东大道歇浦路地铁站店)',
      stars: 3,
      image: require('./assets/9b2383793b12254f0908dd5e0a2d1889.jpeg'),
      score: 4.7,
      scoreText: '超棒',
      reviewCount: '6729',
      collectCount: '4.5万',
      location: '近歇浦路地铁站 · LCM置汇旭辉广场',
      description: '临滨江步道可欣赏陆家嘴夜景',
      oldPrice: 297,
      price: 199,
      tags: ['免费停车', '免费洗衣服务', '机器人服务', '自助早餐'],
      brand: '艺龙酒店科技集团旗下品牌',
      footerTags: ['钻石贵宾价', '满减券', '3项优惠98 >']
    },
    {
      id: 4,
      name: '艺龙安悦酒店(上海浦东大道歇浦路地铁站店)',
      stars: 3,
      image: require('./assets/9b2383793b12254f0908dd5e0a2d1889.jpeg'),
      score: 4.7,
      scoreText: '超棒',
      reviewCount: '6729',
      collectCount: '4.5万',
      location: '近歇浦路地铁站 · LCM置汇旭辉广场',
      description: '临滨江步道可欣赏陆家嘴夜景',
      oldPrice: 297,
      price: 199,
      tags: ['免费停车', '免费洗衣服务', '机器人服务', '自助早餐'],
      brand: '艺龙酒店科技集团旗下品牌',
      footerTags: ['钻石贵宾价', '满减券', '3项优惠98 >']
    },
    {
      id: 5,
      name: '艺龙安悦酒店(上海浦东大道歇浦路地铁站店)',
      stars: 3,
      image: require('./assets/9b2383793b12254f0908dd5e0a2d1889.jpeg'),
      score: 4.7,
      scoreText: '超棒',
      reviewCount: '6729',
      collectCount: '4.5万',
      location: '近歇浦路地铁站 · LCM置汇旭辉广场',
      description: '临滨江步道可欣赏陆家嘴夜景',
      oldPrice: 297,
      price: 199,
      tags: ['免费停车', '免费洗衣服务', '机器人服务', '自助早餐'],
      brand: '艺龙酒店科技集团旗下品牌',
      footerTags: ['钻石贵宾价', '满减券', '3项优惠98 >']
    },
    {
      id: 6,
      name: '艺龙安悦酒店(上海浦东大道歇浦路地铁站店)',
      stars: 3,
      image: require('./assets/9b2383793b12254f0908dd5e0a2d1889.jpeg'),
      score: 4.7,
      scoreText: '超棒',
      reviewCount: '6729',
      collectCount: '4.5万',
      location: '近歇浦路地铁站 · LCM置汇旭辉广场',
      description: '临滨江步道可欣赏陆家嘴夜景',
      oldPrice: 297,
      price: 199,
      tags: ['免费停车', '免费洗衣服务', '机器人服务', '自助早餐'],
      brand: '艺龙酒店科技集团旗下品牌',
      footerTags: ['钻石贵宾价', '满减券', '3项优惠98 >']
    }
  ];

  const staticQuickTags = [
    { label: '返10倍积分', type: 'more', category: 'deals' },
    { label: '天安门广场', type: 'dist', key: 'hot' },
    { label: '双床房', type: 'more', category: 'hot' },
    { label: '含早餐', type: 'more', category: 'hot' },
    { label: '亲子酒店', type: 'more', category: 'hot' },
    { label: '近地铁', type: 'more', category: 'facilities' }
  ];

  const mockLocationData = {
    dist: ['500米内', '1公里内', '2公里内'],
    hot: ['天安门广场', '北京站'],
    admin: ['朝阳区', '海淀区'],
    subway: { '1号线': ['复兴门站'], '2号线': ['西直门站'] },
    transport: { '机场': ['大兴机场'] }
  };

  const filterCategories = {
    hot: { title: '热门筛选', tags: ['亲子酒店', '上榜酒店', '含早餐'] },
    types: { title: '住宿类型', tags: ['酒店', '民宿'] },
    deals: { title: '优惠权益', tags: ['返10倍积分'] },
    facilities: { title: '设施服务', tags: ['免费停车场'] }
  };

  const handleQuickTagClick = (tag) => {
    if (tag.type === 'dist') {
      const isSelected = selectedDistMap[tag.key] === tag.label;
      if (isSelected) {
        const newMap = { ...selectedDistMap };
        delete newMap[tag.key];
        setSelectedDistMap(newMap);
      } else {
        setSelectedDistMap({ ...selectedDistMap, [tag.key]: tag.label });
      }
    } else if (tag.type === 'more') {
      const currentList = selectedMoreFilters[tag.category] || [];
      const newList = currentList.includes(tag.label) ? currentList.filter(t => t !== tag.label) : [...currentList, tag.label];
      setSelectedMoreFilters({ ...selectedMoreFilters, [tag.category]: newList });
    }
  };

  const isTagActive = (tag) => {
    if (tag.type === 'dist') return selectedDistMap[tag.key] === tag.label;
    if (tag.type === 'more') return (selectedMoreFilters[tag.category] || []).includes(tag.label);
    return false;
  };

  const handleDateChange = (val) => {
    setSelectingRange(val);
    if (val && val[0] && val[1] && !dayjs(val[0]).isSame(dayjs(val[1]), 'day')) {
      setConfirmedDateRange(val);
      setCalendarVisible(false);
    }
  };

  const handleCancelCalendar = () => {
    setSelectingRange(confirmedDateRange);
    setCalendarVisible(false);
  };

  const handleLocationSelect = (name) => {
    if (name === '不限') {
      const newMap = { ...selectedDistMap };
      delete newMap[activeSideKey];
      setSelectedDistMap(newMap);
      return;
    }
    setSelectedDistMap(prev => ({ ...prev, [activeSideKey]: name }));
  };

  const toggleMoreFilterTag = (category, tag) => {
    setSelectedMoreFilters(prev => {
      const currentList = prev[category] || [];
      const newList = currentList.includes(tag) ? currentList.filter(t => t !== tag) : [...currentList, tag];
      return { ...prev, [category]: newList };
    });
  };

  const renderMorePanel = () => {
    const currentCategory = filterCategories[filterActiveSideKey];
    return (
      <div className="filter-popup-inner more-complex-panel">
        <div className="side-container">
          <SideBar activeKey={filterActiveSideKey} onChange={setFilterActiveSideKey}>
            {Object.keys(filterCategories).map(key => <SideBar.Item key={key} title={filterCategories[key].title} />)}
          </SideBar>
          <div className="side-content">
            <div className="group-title">{currentCategory.title}</div>
            <div className="filter-grid-v4">
              {currentCategory.tags.map(tag => (
                <div key={tag} className={`complex-tag ${(selectedMoreFilters[filterActiveSideKey] || []).includes(tag) ? 'active' : ''}`} onClick={() => toggleMoreFilterTag(filterActiveSideKey, tag)}>{tag}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel-footer">
          <button className="reset-btn" onClick={() => setSelectedMoreFilters({})}>清空</button>
          <button className="confirm-btn" onClick={() => setActiveFilter(null)}>完成</button>
        </div>
      </div>
    );
  };

  const renderPricePanel = () => (
    <div className="filter-popup-inner price-star-panel">
      <div className="panel-body">
        <div className="section-title">价格 <span>¥{priceRange[0]} - ¥{priceRange[1]}{priceRange[1] >= 1400 ? '以上' : ''}</span></div>
        <div className="slider-box"><Slider range min={0} max={1400} step={50} value={priceRange} onChange={setPriceRange} /></div>
        <div className="grid-box">
          {[{ l: '¥250以下', v: [0, 250] }, { l: '¥250-¥450', v: [250, 450] }, { l: '¥600以上', v: [600, 1400] }].map(p => (
            <div key={p.l} className={`grid-tag ${priceRange[0] === p.v[0] && priceRange[1] === p.v[1] ? 'active' : ''}`} onClick={() => setPriceRange(p.v)}>{p.l}</div>
          ))}
        </div>
        <div className="section-title" style={{ marginTop: '24px' }}>星级/钻级</div>
        <div className="grid-box">
          {['2钻/星及以下', '3钻/星', '4钻/星', '5钻/星'].map(s => (
            <div key={s} className={`grid-tag ${selectedLevels.includes(s) ? 'active' : ''}`} onClick={() => setSelectedLevels(prev => prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s])}>{s}</div>
          ))}
        </div>
      </div>
      <div className="panel-footer"><button className="reset-btn" onClick={() => { setPriceRange([0, 1400]); setSelectedLevels([]); }}>重置</button><button className="confirm-btn" onClick={() => setActiveFilter(null)}>确定</button></div>
    </div>
  );

  const renderSortPanel = () => (
    <div className="filter-popup-inner">
      <div className="sort-list">
        {[{ l: '欢迎度排序', v: 'welcome' }, { l: '好评优先', v: 'score' }, { l: '低价优先', v: 'price_low' }, { l: '高价优先', v: 'price_high' }, { l: '高星优先', v: 'star' }].map(item => (
          <div key={item.v} className={`sort-row ${sortConfig.value === item.v ? 'is-selected' : ''}`} onClick={() => { setSortConfig({ label: item.l, v: item.v }); setActiveFilter(null); }}>
            <span>{item.l}</span>{sortConfig.value === item.v && <i className="check-mark-pure">✓</i>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDistPanel = () => {
    const isThreeCol = activeSideKey === 'transport' || activeSideKey === 'subway';
    let currentRightData = isThreeCol ? (activeSubKey ? mockLocationData[activeSideKey][activeSubKey] : []) : mockLocationData[activeSideKey];
    const selectedInCurrentCategory = selectedDistMap[activeSideKey];
    return (
      <div className="filter-popup-inner dist-panel">
        <div className="side-container">
          <SideBar activeKey={activeSideKey} onChange={k => { setActiveSideKey(k); setActiveSubKey(''); }}>
            <SideBar.Item key='dist' title='直线距离' /><SideBar.Item key='hot' title='热门' /><SideBar.Item key='admin' title='行政区' /><SideBar.Item key='subway' title='地铁线' />
          </SideBar>
          {isThreeCol && (
            <div className="sub-sidebar">
              {Object.keys(mockLocationData[activeSideKey]).map(sub => (<div key={sub} className={`sub-item ${activeSubKey === sub ? 'active' : ''}`} onClick={() => setActiveSubKey(sub)}>{sub}</div>))}
            </div>
          )}
          <div className="side-content">
            <div className={`dist-item ${!selectedInCurrentCategory ? 'is-selected' : ''}`} onClick={() => handleLocationSelect('不限')}><span>不限</span>{!selectedInCurrentCategory && <i className="check-mark-pure">✓</i>}</div>
            {currentRightData.map(item => (
              <div key={item} className={`dist-item ${selectedInCurrentCategory === item ? 'is-selected' : ''}`} onClick={() => handleLocationSelect(item)}><span>{item}</span>{selectedInCurrentCategory === item && <i className="check-mark-pure">✓</i>}</div>
            ))}
          </div>
        </div>
        <div className="panel-footer"><button className="reset-btn" onClick={() => setSelectedDistMap({})}>重置</button><button className="confirm-btn" onClick={() => setActiveFilter(null)}>确定</button></div>
      </div>
    );
  };

  const totalDistCount = Object.keys(selectedDistMap).length;
  const priceStarCount = (priceRange[0] !== 0 || priceRange[1] !== 1400 ? 1 : 0) + selectedLevels.length;
  const moreFilterCount = Object.values(selectedMoreFilters).flat().length;

  return (
    <div className="list-page">
      <div className="list-sticky-header">
        <div className="back-btn" onClick={onBack}>&lt;</div>
        <div className="search-info-bar">
          <div className="header-city" onClick={() => setCityPickerVisible(true)}>{city}</div>
          <div className="vertical-divider"></div>
          <div className="date-bundle-box" onClick={() => setCalendarVisible(true)}>
            <div className="date-item-row"><span className="date-val">{dayjs(confirmedDateRange[0]).format('MM-DD')}</span></div>
            <div className="date-item-row"><span className="date-val">{dayjs(confirmedDateRange[1]).format('MM-DD')}</span></div>
          </div>
          <div className="night-info">{dayjs(confirmedDateRange[1]).diff(dayjs(confirmedDateRange[0]), 'day')}晚</div>
          <div className="vertical-divider"></div>
          <div className="inner-search-area"><i className="search-icon-small"></i><input className="list-keyword-input" placeholder={searchParams.keyword || "位置/品牌/酒店"} readOnly /></div>
        </div>
      </div>

      <div className="list-filter-bar-v2">
        {[{ t: 'sort', l: sortConfig.label, c: sortConfig.value !== 'welcome' }, { t: 'dist', l: '位置距离', n: totalDistCount }, { t: 'price', l: '价格/星级', n: priceStarCount }, { t: 'more', l: '筛选', n: moreFilterCount }].map(item => (
          <div key={item.t} className={`filter-tab-item ${activeFilter === item.t || item.c || item.n > 0 ? 'active-blue' : ''}`} onClick={() => setActiveFilter(activeFilter === item.t ? null : item.t)}>
            <span>{item.l}{item.n > 0 ? ` · ${item.n}` : ''}</span><i className="arrow-icon"></i>
          </div>
        ))}
      </div>

      <div className="quick-tags-scroll-v2">
        {staticQuickTags.map((tag, idx) => (
          <div key={idx} className={`quick-tag-pill-v2 ${isTagActive(tag) ? 'active' : ''}`} onClick={() => handleQuickTagClick(tag)}>
            <span className="tag-text">{tag.label}</span>{isTagActive(tag) && <i className="tag-check-icon">✓</i>}
          </div>
        ))}
      </div>

      <div className="hotel-results-list">
        {mockHotels.map(hotel => (
          <div
            key={hotel.id}
            className="hotel-card-v4"
            onClick={() => onSelectHotel({ ...hotel, rawDateRange: confirmedDateRange })}
          >
            <div className="hotel-card-v4-left">
              <img src={hotel.image} alt={hotel.name} />
            </div>
            <div className="hotel-card-v4-right">
              <h4 className="v4-hotel-name">{hotel.name} <span className="v4-stars">{"★".repeat(hotel.stars)}</span></h4>
              <div className="v4-score-line">
                <span className="v4-score-box">{hotel.score} {hotel.scoreText}</span>
                <span className="v4-count">{hotel.reviewCount}点评 · {hotel.collectCount}收藏</span>
              </div>
              <div className="v4-loc-line">{hotel.location}</div>
              {hotel.description && <div className="v4-desc-line">{hotel.description}</div>}
              <div className="v4-tags-row">
                {hotel.tags.map(t => <span key={t} className="v4-tag-item">{t}</span>)}
              </div>
              {hotel.rank && <div className="v4-rank-line">🎖 {hotel.rank}</div>}
              {hotel.brand && <div className="v4-brand-line">{hotel.brand}</div>}

              <div className="v4-price-row">
                {hotel.oldPrice && <span className="v4-old-price">¥{hotel.oldPrice}</span>}
                <span className="v4-currency">¥</span>
                <span className="v4-amount">{hotel.price}</span>
                <span className="v4-起">起</span>
              </div>

              {hotel.footerTags && (
                <div className="v4-footer-tags">
                  {hotel.footerTags.map(f => <span key={f} className="v4-f-tag">{f}</span>)}
                </div>
              )}
              {hotel.priceLabel && <div className="v4-price-bottom-label">{hotel.priceLabel}</div>}
            </div>
          </div>
        ))}
      </div>

      <Popup visible={!!activeFilter} onMaskClick={() => setActiveFilter(null)} position='top' mask={true} bodyStyle={{ marginTop: '98px', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        {activeFilter === 'sort' && renderSortPanel()}
        {activeFilter === 'price' && renderPricePanel()}
        {activeFilter === 'dist' && renderDistPanel()}
        {activeFilter === 'more' && renderMorePanel()}
      </Popup>

      <CascadePicker options={chinaCityData} visible={cityPickerVisible} onClose={() => setCityPickerVisible(false)} onConfirm={(val, extend) => { setCity(extend.items[extend.items.length - 1].label); setCityPickerVisible(false); }} />
      <Popup visible={calendarVisible} onMaskClick={handleCancelCalendar} bodyStyle={{ height: '70vh' }}>
        <Calendar selectionMode='range' value={selectingRange} min={new Date()} onChange={handleDateChange} />
      </Popup>
    </div>
  );
};

export default HotelListPage;
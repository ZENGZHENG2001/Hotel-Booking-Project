import React, { useState, useEffect } from 'react';
import { Swiper, Popup, Calendar } from 'antd-mobile';
import dayjs from 'dayjs';
import './HotelDetailPage.css';

const HotelDetailPage = ({ hotel, onBack }) => {
  // 滚动监听逻辑
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 滚动超过 50px 时切换状态
      setIsFixed(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitialDate = () => {
    if (hotel && hotel.rawDateRange) return hotel.rawDateRange;
    return [new Date(), dayjs().add(1, 'day').toDate()];
  };

  const initialDate = getInitialDate();
  const [confirmedDateRange, setConfirmedDateRange] = useState(initialDate);
  const [selectingRange, setSelectingRange] = useState(initialDate);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const handleDateChange = (val) => {
    setSelectingRange(val);
    if (val && val[0] && val[1] && !dayjs(val[0]).isSame(dayjs(val[1]), 'day')) {
      setConfirmedDateRange(val);
      setCalendarVisible(false);
    }
  };

  const nightCount = dayjs(confirmedDateRange[1]).diff(dayjs(confirmedDateRange[0]), 'day');

  const getDayLabel = (date) => {
    const d = dayjs(date);
    const today = dayjs().startOf('day');
    if (d.isSame(today, 'day')) return '今天';
    if (d.isSame(today.add(1, 'day'), 'day')) return '明天';
    return d.format('ddd');
  };

  const roomTypes = (hotel.rooms || []).sort((a, b) => a.price - b.price);

  return (
    <div className="detail-page-v2">
      {/* 修改后的导航栏：名字在箭头右边，去掉右侧图标 */}
      <div className={`nav-bar-immersion ${isFixed ? 'nav-bar-fixed' : ''}`}>
        <div className="nav-left-content">
          <div className="nav-circle-btn" onClick={onBack}>&lt;</div>
          <span className="nav-hotel-name-inline">{hotel.name}</span>
        </div>
        {/* 右侧留空，去掉收藏和搜索 */}
      </div>

      <div className="detail-header-v2">
        <Swiper autoplay loop className="banner-swiper-v2">
          {[1, 2, 3].map(i => (
            <Swiper.Item key={i}>
              <div className="banner-img-v2" style={{ backgroundImage: `url(${hotel.image})` }}>
                <div className="video-play-icon">▶</div>
                <div className="img-category-tags">
                  <span>封面</span><span>精选</span><span>位置</span><span>相册</span>
                </div>
              </div>
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      <div className="info-card-v2">
        <div className="hotel-header-line">
          <h2 className="hotel-title">{hotel.name} <span className="stars-row">{"★".repeat(hotel.stars)}</span></h2>
          <div className="recom-badge">口碑榜 · 上榜酒店</div>
        </div>
        <div className="rank-text-line">{hotel.rankText}</div>
        <div className="facility-grid-v2">
          {hotel.quickFacilities?.map((f, i) => (
            <div key={i} className="fac-v2-item"><div className="fac-icon">{f.icon}</div><span>{f.label}</span></div>
          ))}
          <div className="fac-v2-more">设施政策 &gt;</div>
        </div>
        <div className="score-address-container">
          <div className="blue-score-section">
            <div className="score-top-line">
              <span className="score-num">{hotel.score}</span>
              <span className="score-label">{hotel.scoreLabel}</span>
              <span className="review-total">{hotel.reviewCount}条 </span>
            </div>
            <div className="score-quote">{hotel.comment}</div>
          </div>
          <div className="gray-address-section">
            <div className="address-content">
              <div className="address-main">{hotel.address} | 距您直线步行约22分钟</div>
            </div>
            <div className="address-map-btn">
              <div className="map-icon-box">📍</div><span>地图</span>
            </div>
          </div>
        </div>
      </div>

      <div className="booking-filter-card">
        <div className="date-picker-bar-v3" onClick={() => setCalendarVisible(true)}>
          <div className="date-main-content">
            <div className="date-v-box active-date">
              <span className="d-date">{dayjs(confirmedDateRange[0]).format('M月D日')}</span>
              <span className="d-day">{getDayLabel(confirmedDateRange[0])}</span>
            </div>
            <div className="night-pill-v3">{nightCount}晚</div>
            <div className="date-v-box">
              <span className="d-date">{dayjs(confirmedDateRange[1]).format('M月D日')}</span>
              <span className="d-day">{getDayLabel(confirmedDateRange[1])}</span>
            </div>
          </div>
          <div className="arrow-next-v3"></div>
        </div>
        <div className="room-filters-scroll-v3">
          {['含早餐', '立即确认', '大床房', '双床房', '免费取消'].map(tag => (
            <div key={tag} className="filter-pill-v3">{tag}</div>
          ))}
          <div className="filter-pill-more-v3">筛选 ▾</div>
        </div>
      </div>

      <div className="rooms-list-container-v4">
        {roomTypes.map(room => {
          const isFull = room.stock === 0;
          return (
            <div key={room.id} className={`room-card-v2-styled ${isFull ? 'room-full' : ''}`}>
              <div className="room-img-wrapper">
                <img src={hotel.image} alt="" style={{ filter: isFull ? 'grayscale(100%)' : 'none', opacity: isFull ? 0.6 : 1 }} />
                <div className="room-img-badge">{room.imageCount || 0}</div>
              </div>
              <div className="room-content-wrapper">
                <div className="room-title-line">
                  <h4 className={`room-name-text ${isFull ? 'text-gray' : ''}`}>{room.name}</h4>
                  {isFull && <span className="full-status-tag">已售罄</span>}
                  <div className="room-expand-icon">︿</div>
                </div>
                <div className="room-spec-text">
                  {`${room.bedType || ''} ${room.area || ''} ${room.capacity || ''} ${room.floor || ''}`.trim() || '暂无规格'}
                </div>
                <div className="room-price-only-row">
                  <div className={`price-tag-styled ${isFull ? 'price-gray' : ''}`}>
                    <span className="unit">¥</span><span className="val">{room.price}</span><span className="suffix">{isFull ? ' (满房)' : '起'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="detail-footer-v2">
        <div className="footer-left-chat"><div className="chat-icon-v2">💬</div><span>问酒店</span></div>
        <div className="footer-price-box">
          <span className="price-unit">¥</span><span className="price-val">{hotel.price}</span><span className="price-suffix">起</span>
        </div>
        <button className="footer-main-btn">查看房型</button>
      </div>

      <Popup visible={calendarVisible} onMaskClick={() => setCalendarVisible(false)} bodyStyle={{ height: '70vh' }}>
        <Calendar selectionMode='range' value={selectingRange} min={new Date()} onChange={handleDateChange} />
      </Popup>
    </div>
  );
};

export default HotelDetailPage;
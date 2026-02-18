import React, { useState } from 'react';
import { Swiper, Popup, Calendar } from 'antd-mobile';
import dayjs from 'dayjs';
import './HotelDetailPage.css';

const HotelDetailPage = ({ hotel, onBack }) => {
  const getInitialDate = () => {
    if (hotel && hotel.rawDateRange) {
      return hotel.rawDateRange;
    }
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

  const handleCancelCalendar = () => {
    setSelectingRange(confirmedDateRange);
    setCalendarVisible(false);
  };

  const nightCount = dayjs(confirmedDateRange[1]).diff(dayjs(confirmedDateRange[0]), 'day');

  const getDayLabel = (date) => {
    const d = dayjs(date);
    const today = dayjs().startOf('day');
    if (d.isSame(today, 'day')) return '今天';
    if (d.isSame(today.add(1, 'day'), 'day')) return '明天';
    return d.format('ddd');
  };

  const roomTypes = [
    {
      id: 'r1',
      name: '经典双床房',
      specs: '2张1.2米单人床 40m² 2人入住 5-15层',
      image: hotel.image,
      price: hotel.price,
      tags: ['含早餐', '立即确认', '大床房']
    }
  ];

  return (
    <div className="detail-page-v2">
      <div className="detail-header-v2">
        <div className="nav-bar-v2">
          <div className="nav-back" onClick={onBack}>&lt;</div>
          <div className="nav-right">
            <span className="icon-item">🔍</span>
            <span className="icon-item">♡</span>
          </div>
        </div>
        <Swiper autoplay loop className="banner-swiper-v2">
          {[1, 2, 3].map(i => (
            <Swiper.Item key={i}>
              <div className="banner-img-v2" style={{ backgroundImage: `url(${hotel.image})` }}>
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
        <div className="rank-text-line">上海美景酒店榜 No.16 </div>
        <div className="facility-grid-v2">
          <div className="fac-v2-item"><div className="fac-icon">🏢</div><span>2020年开业</span></div>
          <div className="fac-v2-item"><div className="fac-icon">🛋️</div><span>新中式风</span></div>
          <div className="fac-v2-item"><div className="fac-icon">🅿️</div><span>免费停车</span></div>
          <div className="fac-v2-item"><div className="fac-icon">🌊</div><span>一线江景</span></div>
          <div className="fac-v2-more">设施政策 &gt;</div>
        </div>
        <div className="score-address-container">
          <div className="blue-score-section">
            <div className="score-top-line">
              <span className="score-num">{hotel.score}</span>
              <span className="score-label">{hotel.scoreText}</span>
              <span className="review-total">{hotel.reviewCount}条 </span>
            </div>
            <div className="score-quote">“中式风格装修，舒适安逸”</div>
          </div>
          <div className="gray-address-section">
            <div className="address-content">
              <div className="address-main">距离塘桥地铁站步行1.5公里,约22分钟 | 浦东新区浦明路868弄3号楼</div>
            </div>
            <div className="address-map-btn">
              <div className="map-icon-box">📍</div><span>地图</span>
            </div>
          </div>
        </div>
      </div>

      <div className="booking-area-v3">
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

        {/* <div className="midnight-bubble-tip">
          <div className="bubble-arrow"></div> */}
        {/* <div className="bubble-content">
            <span className="moon-icon">🌙</span>
            当前已过0点，如需今天凌晨6点前入住，请选择“今天凌晨”
          </div> */}
        {/* </div> */}

        <div className="room-filters-scroll-v3">
          {['含早餐', '立即确认', '大床房', '双床房', '免费取消'].map(tag => (
            <div key={tag} className="filter-pill-v3">{tag}</div>
          ))}
          <div className="filter-pill-more-v3">筛选 ▾</div>
        </div>

        <div className="rooms-list-v2">
          {roomTypes.map(room => (
            <div key={room.id} className="room-card-v2">
              <div className="room-img-v2">
                <img src={room.image} alt="" />
                <div className="img-count-tag">12</div>
              </div>
              <div className="room-info-v2">
                <h4 className="room-name-v2">{room.name} <span className="info-icon">ⓘ</span></h4>
                <div className="room-spec-v2">2张1.2米单人床 40m² 2人入住 5-15层</div>
                <div className="room-tags-v2">
                  {room.tags.map(t => <span key={t} className="r-tag-v2">{t}</span>)}
                </div>
                <div className="room-action-line-v2">
                  <div className="price-v2"><span className="unit">¥</span><span className="val">{room.price}</span><span className="suffix">起</span></div>
                  <button className="check-btn-v2">查看房型</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="detail-footer-v2">
        <div className="footer-left-chat">
          <div className="chat-icon-v2">💬</div><span>问酒店</span>
        </div>
        <div className="footer-price-box">
          <span className="price-unit">¥</span><span className="price-val">{hotel.price}</span><span className="price-suffix">起</span>
        </div>
        <button className="footer-main-btn">查看房型</button>
      </div>

      <Popup visible={calendarVisible} onMaskClick={handleCancelCalendar} bodyStyle={{ height: '70vh' }}>
        <Calendar
          selectionMode='range'
          value={selectingRange}
          min={new Date()}
          onChange={handleDateChange}
        />
      </Popup>
    </div>
  );
};

export default HotelDetailPage;
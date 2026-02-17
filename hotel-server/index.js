const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// 允许跨域，这样你的前端才能访问这个后端
app.use(cors());
app.use(express.json());

// 这是一个测试接口
app.get('/api/test', (req, res) => {
  res.json({
    message: "来自后端 Node.js 的问候：地基已打好！",
    status: "success"
  });
});

app.listen(PORT, () => {
  console.log(`服务器已启动，正在监听端口: ${PORT}`);
});
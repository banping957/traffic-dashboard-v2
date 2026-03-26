-- 创建文章表
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  typeLabel VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  timeSlot VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  wordCount INTEGER DEFAULT 0,
  summary TEXT,
  file VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT INTO articles (title, type, typeLabel, date, timeSlot, summary, wordCount, file, status)
VALUES 
  ('我和闺蜜同分不同命：她去了武大，我去了华科', 'story', '人物故事', '2026-03-19', '上午', '同分不同命的真实故事，武大vs华科就业数据对比', 1150, '2026-03-19-am-wuda-vs-huake.html', 'draft'),
  ('2026年就业率最高的5个专业，第1个岗位需求暴涨215%', 'analysis', '专业解读', '2026-03-19', '下午', 'AI时代新工科风口，具身智能年薪33万+', 1180, '2026-03-19-pm-top5-majors.html', 'draft'),
  ('杜伦超越牛剑！2026英国大学排名32年来最大变局', 'analysis', '专业解读', '2026-03-16', '上午', 'TIMES 2026排名解读，杜伦首次进前三', 1100, '2026-03-16-durham-ranking.html', 'draft'),
  ('2026中国大学排名出炉：北航第9、南开进前7，最大黑马是它', 'analysis', '专业解读', '2026-03-16', '下午', 'ABC 2026排名，福耀科大首次入榜即进50强', 1050, '2026-03-16-china-ranking.html', 'draft'),
  ('我研究了3000份招聘JD，发现这5个专业正在被AI"活埋"', 'analysis', '专业解读', '2026-03-18', '上午', '2026年就业预警，这些专业需谨慎选择', 1180, '2026-03-18-am-5-worst-majors-fixed.html', 'draft'),
  ('采访了100个年薪50万+的985生，他们大学都偷偷做了一件事', 'story', '人物故事', '2026-03-18', '下午', '高薪毕业生的共同特征调研', 1150, '2026-03-18-pm-985-graduates-research.html', 'draft');
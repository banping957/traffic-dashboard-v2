const articles = [
  {
    title: "我和闺蜜同分不同命：她去了武大，我去了华科",
    type: "story",
    typeLabel: "人物故事",
    date: "2026-03-19",
    timeSlot: "上午",
    summary: "同分不同命的真实故事，武大vs华科就业数据对比",
    wordCount: 1150,
    file: "2026-03-19-am-wuda-vs-huake.html",
    status: "draft"
  },
  {
    title: "2026年就业率最高的5个专业，第1个岗位需求暴涨215%",
    type: "analysis",
    typeLabel: "专业解读",
    date: "2026-03-19",
    timeSlot: "下午",
    summary: "AI时代新工科风口，具身智能年薪33万+",
    wordCount: 1180,
    file: "2026-03-19-pm-top5-majors.html",
    status: "draft"
  },
  {
    title: "杜伦超越牛剑！2026英国大学排名32年来最大变局",
    type: "analysis",
    typeLabel: "专业解读",
    date: "2026-03-16",
    timeSlot: "上午",
    summary: "TIMES 2026排名解读，杜伦首次进前三",
    wordCount: 1100,
    file: "2026-03-16-durham-ranking.html",
    status: "draft"
  },
  {
    title: "2026中国大学排名出炉：北航第9、南开进前7，最大黑马是它",
    type: "analysis",
    typeLabel: "专业解读",
    date: "2026-03-16",
    timeSlot: "下午",
    summary: "ABC 2026排名，福耀科大首次入榜即进50强",
    wordCount: 1050,
    file: "2026-03-16-china-ranking.html",
    status: "draft"
  },
  {
    title: "我研究了3000份招聘JD，发现这5个专业正在被AI\"活埋\"",
    type: "analysis",
    typeLabel: "专业解读",
    date: "2026-03-18",
    timeSlot: "上午",
    summary: "2026年就业预警，这些专业需谨慎选择",
    wordCount: 1180,
    file: "2026-03-18-am-5-worst-majors-fixed.html",
    status: "draft"
  },
  {
    title: "采访了100个年薪50万+的985生，他们大学都偷偷做了一件事",
    type: "story",
    typeLabel: "人物故事",
    date: "2026-03-18",
    timeSlot: "下午",
    summary: "高薪毕业生的共同特征调研",
    wordCount: 1150,
    file: "2026-03-18-pm-985-graduates-research.html",
    status: "draft"
  }
];

console.log('INSERT INTO articles (title, type, typeLabel, date, timeSlot, summary, wordCount, file, status, views, likes, comments) VALUES');
articles.forEach((a, i) => {
  const comma = i < articles.length - 1 ? ',' : ';';
  console.log(`('${a.title.replace(/'/g, "''")}', '${a.type}', '${a.typeLabel}', '${a.date}', '${a.timeSlot}', '${a.summary.replace(/'/g, "''")}', ${a.wordCount}, '${a.file}', '${a.status}', 0, 0, 0)${comma}`);
});
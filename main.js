// ==UserScript==
// @name         翼课网答案提取
// @namespace    https://github.com/Wulikecode/ykw
// @version      1.2
// @description  答案提取，含UI在页面左下角
// @run-at       document-end
// @match        https://www.ekwing.com/exam/student/examload?*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const createEl = (tag, style, html) => {
        const el = document.createElement(tag);
        if (style) el.style.cssText = style;
        if (html) el.innerHTML = html;
        return el;
    };

    const showResults = () => {
        const data = window.spoken_list;
        if (!data) return alert("数据加载中...");

        // 一次性完成排序、提取和格式化
        const results = Object.values(data)
            .sort((a, b) => a.model_index - b.model_index)
            .map(item => {
                let ans = [];
                if (item.model_type === "1") ans.push(item.real_text); // 模仿朗读
                else if (item.ques_list?.length) item.ques_list.forEach(q => ans.push(q.answer[0][0])); // 听选/问答[cite: 1]
                else if (item.answer?.length) ans.push(item.answer[0][0]); // 复述[cite: 1]

                return {
                    title: item.model_type_name || item.model_type,
                    answers: ans
                };
            });

        const copyStr = results.flatMap(r => r.answers).join('\n');
        const htmlStr = results.map(r => `
            <div style="margin-top:10px; border-left:3px solid #ff5722; padding-left:8px;">
                <b style="font-size:13px;">${r.title}</b>
                ${r.answers.map(a => `<div style="color:#555;font-size:12px;">• ${a}</div>`).join('')}
            </div>`).join('');

        const panel = createEl('div', `position:fixed;top:5%;left:5%;width:90%;max-height:80%;background:#fff;z-index:99999;border-radius:12px;box-shadow:0 8px 20px #0004;display:flex;flex-direction:column;font-family:sans-serif;`, `
            <div style="padding:12px;background:#eee;display:flex;justify-content:space-between;align-items:center;">
                <b>答案提取</b>
                <span><button id="c-copy">复制</button> <button id="c-close">关闭</button></span>
            </div>
            <div style="padding:12px;overflow-y:auto;">${htmlStr}</div>
        `);

        document.body.appendChild(panel);
        panel.querySelector('#c-close').onclick = () => panel.remove();
        panel.querySelector('#c-copy').onclick = (e) => {
            navigator.clipboard.writeText(copyStr.trim()).then(() => e.target.innerText = "OK!");
        };
    };

    // 右下角极简触发点
    const btn = createEl('div', `position:fixed;bottom:100px;right:15px;width:40px;height:40px;background:#0008;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;z-index:9999;cursor:pointer;`, '答案');
    btn.onclick = showResults;
    setTimeout(() => document.body.appendChild(btn), 1000);
})();